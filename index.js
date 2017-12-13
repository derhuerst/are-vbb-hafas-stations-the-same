'use strict'

const {DateTime} = require('luxon')
const hafas = require('vbb-hafas')
const createCollect = require('hafas-collect-departures-at')
const debug = require('debug')('are-vbb-hafas-stations-the-same') // todo

const nextMonday10am = () => {
	return DateTime.fromMillis(Date.now(), {
		zone: 'Europe/Berlin',
		locale: 'de-DE'
	}).startOf('week').plus({weeks: 1, hours: 10}).toJSDate()
}

const depsEqual = (depA, depB) => {
	if (depA.ref !== depB.ref) return false

	let whenA = +new Date(depA.when)
	if (Number.isNaN(whenA)) return false
	if ('number' !== typeof depA.delay) whenA -= depA.delay * 1000
	let whenB = +new Date(depB.when)
	if (Number.isNaN(whenB)) return false
	if ('number' !== typeof depB.delay) whenB -= depB.delay * 1000
	if (whenA !== whenB) return false

	return true
}

const collect = createCollect(hafas.departures)

const loopCheckSplice = (depAtA, depsAtB) => {
	for (let i = 0; i < depsAtB.length; i++) {
		const depAtB = depsAtB[i]
		if (depsEqual(depAtA, depAtB)) {
			depsAtB.splice(i, 1)
			return depAtB
		}
	}
	return null
}

const same = async (aId, bId, maxIterations = 50) => {
	const when = nextMonday10am()
	const moreDepsAtA = collect(aId, when)[Symbol.iterator]()
	const moreDepsAtB = collect(bId, when)[Symbol.iterator]()

	let iterationsForA = 0, resultsForA = 0
	let iterationsForB = 0, resultsForB = 0, cachedDepsAtB = []

	// todo: use async iteration once supported
	while (iterationsForA < maxIterations && resultsForA < 1000) {
		debug('loading more for A')
		iterationsForA++
		const depsAtA = (await moreDepsAtA.next()).value
		resultsForA += depsAtA.length

		for (let depAtA of depsAtA) {
			debug('A', depAtA.ref, depAtA.line.name, depAtA.when)

			debug('searching in', cachedDepsAtB.length, 'deps cached for B')
			let match = loopCheckSplice(depAtA, cachedDepsAtB)

			// todo: use async iteration once supported
			while (!match && iterationsForB < maxIterations && resultsForB < 1000) {
				debug('no match, loading more for B')
				iterationsForB++
				const depsAtB = (await moreDepsAtB.next()).value
				resultsForB += depsAtB.length
				debug('loaded', depsAtB.length, 'more deps for B')

				match = loopCheckSplice(depAtA, depsAtB)
				cachedDepsAtB = cachedDepsAtB.concat(depsAtB)
				debug('now', cachedDepsAtB.length, 'deps cached for B')
			}

			if (!match) return false
			else debug('B', match.ref, match.line.name, match.when)
		}
	}

	if (resultsForA < 10) throw new Error('not enough departures at ' + aId)
	if (resultsForB < 10) throw new Error('not enough departures at ' + bId)

	return true
}

module.exports = same
