const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'eu', 'fugiat', 'nulla', 'pariatur', 'excepteur',
  'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui',
  'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum',
]

function randomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)]
}

function generateWords(count: number): string[] {
  return Array.from({ length: count }, () => randomWord())
}

function generateSentences(count: number): string[] {
  return Array.from({ length: count }, () => {
    const wordCount = Math.floor(Math.random() * 10) + 6
    const words = generateWords(wordCount)
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
    return words.join(' ') + '.'
  })
}

function generateParagraphs(count: number): string[] {
  return Array.from({ length: count }, () => {
    const sentenceCount = Math.floor(Math.random() * 4) + 3
    return generateSentences(sentenceCount).join(' ')
  })
}

export function generateText(type: 'words' | 'sentences' | 'paragraphs', count: number): string[] {
  switch (type) {
    case 'words':      return generateWords(count)
    case 'sentences':  return generateSentences(count)
    case 'paragraphs': return generateParagraphs(count)
  }
}