/**
 * @typedef {Object} ModuleLesson
 * @property {string} id
 * @property {string} moduleId
 * @property {"Beginner"|"Intermediate"|"Advanced"} level
 * @property {string} title
 * @property {string} summary
 * @property {string[]} keyPoints
 * @property {string[]} commands
 */

/**
 * @typedef {Object} ArchitectureNode
 * @property {string} id
 * @property {string} label
 * @property {string} group
 * @property {string} description
 * @property {string} importance
 * @property {string} failureImpact
 * @property {string} checkCommand
 * @property {string} outputExample
 * @property {string} practicalScenario
 */

/**
 * @typedef {Object} DataFlowStep
 * @property {string} id
 * @property {string} operation
 * @property {string} stage
 * @property {string} explanation
 * @property {string} commandHint
 * @property {string} watchpoint
 * @property {string} failureRisk
 * @property {string[]} animationTargetIds
 */

/**
 * @typedef {Object} DataFlowOperationInfo
 * @property {string} id
 * @property {string} label
 * @property {string} goal
 * @property {string} transactionClass
 * @property {string} lockProfile
 * @property {string} durabilityRule
 * @property {string} dbaFocus
 */

/**
 * @typedef {Object} CommandEntry
 * @property {string} id
 * @property {string} category
 * @property {"Beginner"|"Intermediate"|"Advanced"} level
 * @property {string} syntax
 * @property {string} explanation
 * @property {string} scenario
 * @property {string[]} commonMistakes
 * @property {string} outputExample
 */

/**
 * @typedef {Object} DbaTask
 * @property {string} id
 * @property {string} title
 * @property {string} why
 * @property {string} riskIfSkipped
 * @property {string[]} steps
 * @property {string[]} commands
 * @property {string=} cadence
 * @property {string=} priority
 * @property {string=} executionWindow
 * @property {string=} slaTarget
 * @property {string[]=} references
 */

/**
 * @typedef {Object} RoadmapWeek
 * @property {number} week
 * @property {string} focus
 * @property {string[]} outcomes
 * @property {string[]} exercises
 * @property {number=} estimatedHours
 * @property {string=} milestone
 * @property {string=} interviewCheckpoint
 * @property {string[]=} deliverables
 */

/**
 * @typedef {Object} LabItem
 * @property {string} id
 * @property {"SQL Practice"|"DBA Scenario"|"Mini Challenge"|"Interview Q&A"} type
 * @property {string} title
 * @property {"Beginner"|"Intermediate"|"Advanced"} difficulty
 * @property {string} prompt
 * @property {string} solution
 */

/**
 * @typedef {Object} Flashcard
 * @property {string} id
 * @property {string} front
 * @property {string} back
 * @property {string} topic
 * @property {"Beginner"|"Intermediate"|"Advanced"} level
 */

/**
 * @typedef {Object} QuizQuestion
 * @property {string} id
 * @property {string} question
 * @property {string[]} options
 * @property {number} answerIndex
 * @property {string} explanation
 * @property {"Beginner"|"Intermediate"|"Advanced"} level
 */

/**
 * @typedef {Object} BlogPost
 * @property {string} id
 * @property {string} title
 * @property {string} slug
 * @property {string[]} tags
 * @property {string} date
 * @property {"Beginner"|"Intermediate"|"Advanced"} level
 * @property {number} readMinutes
 * @property {string} summary
 * @property {string} impact
 * @property {string[]} symptoms
 * @property {string[]} triageCommands
 * @property {string[]} body
 * @property {{ label: string, url: string }[]} references
 */

/**
 * @typedef {Object} SecurityControl
 * @property {string} id
 * @property {string} domain
 * @property {"Critical"|"High"|"Medium"} priority
 * @property {"Beginner"|"Intermediate"|"Advanced"} level
 * @property {string} title
 * @property {string} summary
 * @property {string} whyImportant
 * @property {string} verifyCommand
 * @property {string} expectedOutput
 * @property {string} riskIfMissed
 * @property {string} reference
 */

/**
 * @typedef {Object} SecurityPlaybook
 * @property {string} id
 * @property {string} title
 * @property {string} trigger
 * @property {string[]} steps
 * @property {string[]} commands
 * @property {string} reference
 */

/**
 * @typedef {Object} ResourceLink
 * @property {string} id
 * @property {string} title
 * @property {string} url
 * @property {string} category
 * @property {"Beginner"|"Intermediate"|"Advanced"} level
 * @property {string} summary
 * @property {string[]} tags
 */

export {};
