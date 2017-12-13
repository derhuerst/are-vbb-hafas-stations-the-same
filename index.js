'use strict'

const {DateTime} = require('luxon')
const hafas = require('vbb-hafas')

const nextMonday10am = () => {
	return DateTime.fromMillis(Date.now(), {
		zone: 'Europe/Berlin',
		locale: 'de-DE'
	}).startOf('week').plus({weeks: 1, hours: 10}).toJSDate()
}

const isSubsetOfDeps = (depsA, depsB) => {
	depsB = Array.from(depsB) // clone

	// todo: is there a lodash fn for this?
	for (let depA of depsA) {
		let res = false
		for (let i = 0; i < depsB.length; i++) {
			const depB = depsB[i]

			if (depA.ref !== depsB[i].ref) continue

			let whenA = +new Date(depA.when)
			if (Number.isNaN(whenA)) continue
			if ('number' !== typeof depA.delay) whenA -= depA.delay * 1000
			let whenB = +new Date(depB.when)
			if (Number.isNaN(whenB)) continue
			if ('number' !== typeof depB.delay) whenB -= depB.delay * 1000
			if (whenA !== whenB) continue

			depsB.splice(i, 1)
			res = true
			break
		}
		if (!res) return false
	}
	return true
}

const areTheSame = (aId, bId) => {
	const when = nextMonday10am()

	return Promise.all([
		hafas.departures(aId, {when, duration: 30}),
		hafas.departures(bId, {when, duration: 30}),
	])
	.then(([depsAtA, depsAtB]) => {
		if (depsA.length === 0) throw new Error('no departures at ' + aId)
		if (depsB.length === 0) throw new Error('no departures at ' + bId)
		return (
			isSubsetOfDeps(depsAtA, depsAtB) &&
			isSubsetOfDeps(depsAtB, depsAtA)
		)
	})
}

module.exports = areTheSame
