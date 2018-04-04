import { CustomError } from '../custom-error'

const nodeInternal = () =>
	Object.keys(process.binding('natives')).concat(['bootstrap_node', 'node'])

const filter = (names: string[]) =>
	names.map(name => new RegExp(`\\(${name}\\.js:\\d+:\\d+\\)$`))

const cleanStack = (
	stack: string,
	filter: (line: string) => string[] | string,
) =>
	stack
		.split('\n')
		.reduce((stack, line) => stack.concat(filter(line)), [])
		.join('\n')

/**
 * Clean Stacktrace error
 *
 * Usage:
 * const error = CleanError.from('My message')
 * console.log(error.cleanStack())
 */
export class CleanError extends CustomError {
	public static nodeInternal = (patterns => (line: string) =>
		patterns.some(pattern => pattern.test(line)) ? ([] as string[]) : line)(
		filter(nodeInternal()),
	)

	public constructor(message: string) {
		super(message)
	}

	public static from = (message: string) => new CleanError(message)

	public cleanStack(filter = CleanError.nodeInternal) {
		return cleanStack(this.stack, filter)
	}
}