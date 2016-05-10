function recognizeSpeech(phrases, onresult) {
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
    var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
    const grammar = '#JSGF V1.0; grammar phrase; public <phrase> = ' + phrases.join(' | ') + ';';
    let recognition = new SpeechRecognition()
    let speechRecognitionList = new SpeechGrammarList()
    speechRecognitionList.addFromString(grammar, 1)
    recognition.grammars = speechRecognitionList
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.continuous = true
    recognition.maxAlternatives = 1

    recognition.start()
    recognition.onspeechend = () => {
        console.log('end', new Date())
    }
    recognition.onerror = (event) => console.error(event)
    recognition.onresult = onresult
}

let bingoBitmap = [
    _.times(5, _.constant(0)),
    _.times(5, _.constant(0)),
    _.times(5, _.constant(0)),
    _.times(5, _.constant(0)),
    _.times(5, _.constant(0))
]

const isBingoRows = (arr) => !!arr.find(
    line => line.reduce(_.add) === line.length
)

const isBingoCols = (bingoBitmap) => {
    for (let i in bingoBitmap) {
        let sum = 0
        for (let j in bingoBitmap) {
            sum += bingoBitmap[j][i]
            if (sum === bingoBitmap.length) {
                return true
            }
        }
    }
    return false
}

const isBingo = (arr) => isBingoCols(arr) || isBingoRows(arr)

const maybeMark = (phrase, bingoBoard, bingoBitmap) =>
    bingoBoard.filter((row, i) => {
        return row.filter((word, j)=> {
            if (_.toLower(phrase) === _.toLower(word)) {
                bingoBitmap[i][j] = 1
                return true
            }
            return false
        })
    })


const binBy = (groupSize, arr) => (arr).reduce((acc, curr, i) => {
    acc[i % groupSize] = acc[i % groupSize] || []
    acc[i % groupSize].push(curr)
    return acc
}, [])

angular
    .module('game', [])
    .controller('BingoCtrl', BingoCtrl)
    .filter('capitalize', capitalize)

const phrases = _.shuffle([
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
])

const similarSounding = (w) => ({
    atm: 'etl',
    atl: 'etl',
    'atl.com': 'etl',
    guitar: 'data',
    allen: 'analytics',
    btl: 'etl',
    bigcommerce: 'e-commerce',
    big: 'big data',
    buzz: 'fast data',
    call: 'cloud',
    cop: 'kafka',
    costco: 'kafka',
    cough: 'kafka',
    'costco.com': 'kafka',
    common: 'column oriented',
    commerce: 'e-commerce',
    charlene: 'sharding',
    charting: 'sharding',
    chardon: 'sharding',
    charging: 'sharding',
    club: 'cloud',
    columbia: 'column oriented',
    construction: 'unstructured data',
    chrome: 'scrum',
    cream: 'scrum',
    crime: 'scrum',
    california: 'data volume',
    conundrum: 'cassandra',
    dictator: 'big data',
    ecommerce: 'e-commerce',
    finding: 'sharding',
    firstdata: 'fast data',
    first: 'fast data',
    flowers: 'cloud',
    german: 'scrum',
    harding: 'sharding',
    hi: 'hive',
    high: 'hive',
    how: 'hadoop',
    honda: 'hadoop',
    'high-end': 'hive',
    'high-fiber': 'hive',
    higher: 'hive',
    hydro: 'hadoop',
    home: 'column oriented',
    horton: 'data volume',
    knife: 'hive',
    kobe: 'column oriented',
    life: 'hive',
    love: 'data volume',
    mount: 'mapreduce',
    maureen: 'column oritented',
    produce: 'mapreduce',
    performers: 'performance',
    news: 'mapreduce',
    reduce: 'mapreduce',
    juice: 'mapreduce',
    santa: 'fast data',
    patagonia: 'data volume',
    oriented: 'column oriented',
    oriental: 'column oriented',
    reviews: 'mapreduce',
    roaming: 'data volume',
    mattresses: 'mapreduce',
    secret: 'no squel',
    sleep: 'no sequel',
    scrub: 'scrum',
    scope: 'scoop',
    scuba: 'scoop',
    scram: 'scrum',
    school: 'scoop',
    skyrim: 'scrum',
    sharing: 'sharding',
    sequins: 'sharding',
    spawn: 'scoop',
    starting: 'sharding',
    strong: 'scrum',
    structured: 'unstructured data',
    sequel: 'no sequel',
    squad: 'scoop',
    roadhouse: 'data warehouse',
    rhel: 'etl',
    real: 'real-time',
    house: 'data warehouse',
    translator: 'fast data',
    translate: 'fast data',
    tractor: 'unstructured data',
    time: 'real-time',
    understanding: 'sharding',
    verdict: 'vertical database',
    vertica: 'vertical database',
    volume: 'data volume',
    vertical: 'vertical database',
    warehouse: 'data warehouse',
    warehousing: 'data warehouse'
}[w] || w)

function BingoCtrl($scope) {
    $scope.bingoBitmap = bingoBitmap
    $scope.isBingo = isBingo(bingoBitmap)
    $scope.picked = []
    $scope.bingoBoard = binBy(5, phrases)
    $scope.startRecognizing = () =>
        recognizeSpeech(phrases, (event) => {
            const lastResult = _.last(event.results)[0]
            const speechTranscript = _.toLower(lastResult.transcript)
                .split(' ')
                .map(similarSounding)
                .join(' ')

            console.log(speechTranscript, ':', lastResult.transcript, lastResult.confidence)

            $scope.picked = _.uniq($scope.picked.concat(newMatchedWords(speechTranscript)))
            $scope.picked.map(w => maybeMark(w, $scope.bingoBoard, bingoBitmap))
            $scope.isBingo = isBingo(bingoBitmap)
            console.log($scope.isBingo, isBingo(bingoBitmap))

            $scope.$apply()
        })

    const newMatchedWords = (transcript) =>
        phrases.map(_.toLower)
            .filter(p => _.includes(transcript, p))

    const isPicked = (word) => _.includes($scope.picked, _.toLower(word))
    $scope.isHighlight = (word) => isPicked(word) ? 'picked' : ''
    window.scope = $scope
}

// http://stackoverflow.com/questions/30207272/capitalize-the-first-letter-of-string-in-angularjs
function capitalize() {
    return function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }
}