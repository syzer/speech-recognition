var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

// TODO scram, Skyrim, scrub => scrum
// ATM => ETL
// Allen TX => analytics
const phrases = [
    'column oriented',
    'vertical database',
    'sharding',
    'ZooKeeper',
    'data warehouse',
    'column oriented database',
    'realtime analytics',
    'hive',
    'ETL',
    'Kafka',
    'data volume',
    'fast data',
    'mapreduce',
    'data cloud',
    'Cassandra',
    'realtime',
    'analytics',
    'unstructured data',
    'scoop',
    'no sequel',
    'big data',
    'scrum',
    'data warehouse',
    'e-commerce',
    'performance'
]

const binBy = (groupSize, arr) => (arr).reduce((acc, curr, i) => {
    acc[i % groupSize] = acc[i % groupSize] || []
    acc[i % groupSize].push(curr)
    return acc
}, [])

var bingoBoard = binBy(5, phrases)

var phrasePara = document.querySelector('.phrase')
var resultPara = document.querySelector('.result')
var diagnosticPara = document.querySelector('.output')
var testBtn = document.querySelector('button')

function playBingo() {
    testBtn.disabled = true
    testBtn.textContent = 'Test in progress'

    var phrase = _.sample(phrases)
    phrasePara.textContent = phrase
    resultPara.textContent = 'Right or wrong?'
    resultPara.style.background = 'rgba(0,0,0,0.2)'
    diagnosticPara.textContent = '...diagnostic messages'

    var grammar = '#JSGF V1.0; grammar phrase; public <phrase> = ' + phrases.join(' | ') + ';';
    var recognition = new SpeechRecognition()
    var speechRecognitionList = new SpeechGrammarList()
    speechRecognitionList.addFromString(grammar, 1)
    recognition.grammars = speechRecognitionList
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.continuous = true
    recognition.maxAlternatives = 1

    recognition.start()

    // SpeechRecognitionAlternative
    recognition.onresult = (event) => {
        var lastResult = _.last(event.results)[0]
        var speechTranscript = lastResult.transcript
        console.log(speechTranscript, event)
        diagnosticPara.textContent = 'Speech received: ' + speechTranscript + '.'
        if (speechTranscript.toLowerCase() === phrase.toLowerCase()) {
            resultPara.textContent = 'I heard the correct phrase!'
            resultPara.style.background = 'lime'
        } else {
            resultPara.textContent = 'That didn\'t sound right.'
            resultPara.style.background = 'red'
        }

        console.log('Confidence', lastResult.confidence)
    }

    recognition.onspeechend = () => {
        // recognition.stop()
        testBtn.disabled = false
        testBtn.textContent = 'Start new test'
    }

    recognition.onerror = (event) => console.error(event)

}

testBtn.addEventListener('click', playBingo)

let bingoMatch = [
    _.times(5, _.constant(0)),
    _.times(5, _.constant(0)),
    _.times(5, _.constant(0)),
    _.times(5, _.constant(0)),
    _.times(5, _.constant(0))
]

const isBingoRows = (arr) => arr.map(
    line => line.reduce(_.add) === line.length
).find(line => line) ? true : false

const isBingoCols = (bingoMatch) => {
    for (let i in bingoMatch) {
        let sum = 0
        for (let j in bingoMatch) {
            sum += bingoMatch[j][i]
            if (sum === bingoMatch.length) {
                return true
            }
        }
    }
    return false
}
const isBingo = (arr) => isBingoCols(arr) || isBingoRows(arr)

const test = () => {
    bingoMatch[0] = _.times(5, _.constant(1))
    for (let i in bingoMatch) {
        bingoMatch[i][0] = 1
    }
    console.log(isBingoCols(bingoMatch))
    console.log(isBingoRows(bingoMatch))
    console.warn(isBingo(bingoMatch))
}

const maybeMark = (phrase, bingoBoard, bingoMatch) => {
    bingoBoard.filter((row, i) => {
        return row.filter((word, j)=> {
            if (phrase === word) {
                bingoMatch[i][j] = 1
                return true
            }
            return false
        })
    })
}

maybeMark('ETL', bingoBoard, bingoMatch)
maybeMark('column oriented', bingoBoard, bingoMatch)
console.log(bingoMatch)

angular
    .module('game', [])
    .controller('BingoCtrl', function ($scope) {
        $scope.bingoBoard = bingoBoard
        $scope.picked = 'ETL'
        const isPicked = (word) => word === $scope.picked
        $scope.checkHighlight = (word) => isPicked(word) ? 'picked' : ''
    })
