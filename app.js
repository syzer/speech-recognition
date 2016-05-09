function recognizeSpeech(phrases) {
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
    var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
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
    recognition.onspeechend = () => {
        // recognition.stop()
    }

    recognition.onerror = (event) => console.error(event)

    return recognition
}

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

const binBy = (groupSize, arr) => (arr).reduce((acc, curr, i) => {
    acc[i % groupSize] = acc[i % groupSize] || []
    acc[i % groupSize].push(curr)
    return acc
}, [])

angular
    .module('game', [])
    .controller('BingoCtrl', BingoCtrl)

const phrases = [
    'column oriented',
    'vertical database',
    'sharding',
    'ZooKeeper',
    'data warehouse',
    'Hadoop',
    'velocity',
    'hive',
    'ETL',
    'Kafka',
    'data volume',
    'fast data',
    'mapreduce',
    'cloud',
    'Cassandra',
    'real-time',
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

const similarSounding = (w) => ({
    atm: 'etl',
    atl: 'etl',
    guitar: 'data',
    'allen tx': 'analytics',
    btl: 'etl',
    bigcommerce: 'e-commerce',
    buzz: 'fast data',
    call: 'cloud',
    costco: 'kafka',
    common: 'column oriented',
    charlene: 'charlene',
    charting: 'sharding',
    charging: 'sharding',
    columbia: 'column oriented',
    construction: 'unstructured data',
    ecommerce: 'e-commerce',
    harding: 'sharding',
    hi: 'hive',
    higher: 'hive',
    mount: 'mapreduce',
    reduce: 'mapreduce',
    santa: 'fast data',
    patagonia: 'data volume',
    oriented: 'column oriented',
    reviews: 'mapreduce',
    scrub: 'scrum',
    scram: 'scrum',
    school: 'scoop',
    skyrim: 'scrum',
    starting: 'sharding',
    structured: 'unstructured data',
    sequel: 'no sequel',
    squad: 'scoop',
    translator: 'fast data',
    understanding: 'sharding',
    verdict: 'vertical'
}[w] || w)

function BingoCtrl($scope) {
    let recognition

    $scope.picked = []
    $scope.bingoBoard = binBy(5, phrases)
    $scope.transcript = ''
    $scope.startRecognizing = () => {
        recognition = recognizeSpeech(phrases)
        recognition.onresult = (event) => {
            let lastResult = _.last(event.results)[0]
            let speechTranscript = _.toLower(lastResult.transcript)
                .split(' ')
                .map(similarSounding)
                .join(' ')

            console.log(speechTranscript, lastResult.transcript, lastResult.confidence)

            $scope.transcript += ' ' + speechTranscript
            $scope.picked = _.uniq($scope.picked
                .concat(newMatchedWords(speechTranscript)))

            $scope.$apply()
        }
    }

    const newMatchedWords = (transcript) =>
        phrases.map(_.toLower)
            .filter(p => _.includes(transcript, p))

    const isPicked = (word) => _.includes($scope.picked, _.toLower(word))
    $scope.isHighlight = (word) => isPicked(word) ? 'picked' : ''
}