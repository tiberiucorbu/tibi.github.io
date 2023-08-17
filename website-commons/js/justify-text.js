// falback idea: a vertical indexed loop. just add the amout of space needed between each word from top to bottom
function distributeWhitespace(whiteSpaceToAdd, whiteSpaceCount) {
    const whiteSpaces = Array.from({length: whiteSpaceCount}).fill(0, 0, whiteSpaceCount)
    for (let i = 0; i < whiteSpaceToAdd; i++) {
        const idx = i % whiteSpaceCount
        whiteSpaces[idx]++
    }
    console.debug('white space between the words', whiteSpaces, whiteSpaceToAdd, whiteSpaceCount)
    return whiteSpaces;
}

function partition(width) {
    return (acc, word) => {
        let currentRow = acc[acc.length - 1]
        if ((currentRow.wordTotalLength + (currentRow.words.length - 1) + word.length + 1) > width) {
            acc.push({words: [word], wordTotalLength: word.length})
        } else {
            currentRow.wordTotalLength += word.length
            currentRow.words.push(word)
        }
        return acc
    }
}

function glueLine(whiteSpaces) {
    return (rowAsString, word, idx, words) =>
        (idx === words.length - 1) ?
            rowAsString + word :  // last word just gets appended
            rowAsString + word + ' '.repeat(whiteSpaces[idx])

}

// Glue the string back together
// Got very annoyed here, I don't find the right computations with simple calculus when a row contains
// for example 4 whitespace places and 6 whitespaces to spread between
// the words { words: [ 'tempor', 'eget.', 'In', 'quis', 'rhoncus' ], wordTotalLength: 24 } whiteSpaceCount
// 4 whiteSpaceToAdd 6
function glueParagraph(width) {
    return (result, row, rowIdx, rows) => {
        const whiteSpaceCount = row.words.length - 1
        const whiteSpaceToAdd = width - row.wordTotalLength
        // const extraSpace = whiteSpaceToAdd % 2; // is it an odd number  // not needed
        // const whiteChunkLength = Math.round(whiteSpaceToAdd/whiteSpaceCount); // this didn't cut the cacke
        const whiteSpaces = distributeWhitespace(whiteSpaceToAdd, whiteSpaceCount)
        console.debug(row, "whitespace places count:", whiteSpaceCount, 'whiteSpaceToAdd', whiteSpaceToAdd, "whitespace distribution", whiteSpaces)

        const line = rows.length - 1 === rowIdx ? row.words.join(' ') : row.words.reduce(glueLine(whiteSpaces), "") + '\n'
        console.debug('line length', line.length)

        return result + line
    }
}

export function justify(text, width) {
    // This code fist splits and slice the sting and after it puts it back together
    const result = text
        .split(' ')
        // Partinion the words
        .reduce(partition(width), [{wordTotalLength: 0, words: []}])
        .reduce(glueParagraph(width), "")
    return result
}