'use strict'

const test = require('tape')

const s = require('.')

test('should identify certain stations as the same', async (t) => {
	t.ok(await s('900000100003', '900000100703'), 'Alexanderpl. & Alexanderpl. U2')
	t.ok(await s('900000009202', '900000009272'), 'Osloer Str. & Osloer Str. 2')
	t.ok(await s('900000057103', '900000057102'), 'Yorckstr. & Yorckstr. S1 U7')
	t.ok(await s('900000057103', '900000058103'), 'Yorckstr. & Yorckstr. S2 S25 U7')
	t.ok(await s('900000320004', '900000320010'), 'Strausberg & Strausberg Tram')
	t.ok(await s('900000186001', '900000186701'), 'Günau & Grünau Adlergestell')
	t.ok(await s('900000186001', '900000186702'), 'Günau & Grünau Wassersportallee')
	t.ok(await s('900000186001', '900000186703'), 'Günau & Grünau Busendstelle')
	t.ok(await s('900000186001', '900000186704'), 'Grünau & Grünau Richterstr')
	t.ok(await s('900000445083', '900000445122'), 'Klinge & Klinge Bhf.')

	t.end()
})

test('should identify certain stations as separate', async (t) => {
	t.notOk(await s('900000024202', '900000024101'), 'Wilmerdorfer Str. & Charlottenburg')
	t.notOk(await s('900000015104', '900000015152'), 'Ohlauer Str. & Spreewaldpl.')
	t.notOk(await s('900000014152', '900000014105'), 'Mariannenpl. & Waldemarstr/Manteuffelstr')
	t.notOk(await s('900000089502', '900000089652'), 'Wasserwerk Tegel & Maienwerderweg')
	t.notOk(await s('900000100042', '900000110505'), 'Zionskirchplatz & Schwedter Str.')
	t.notOk(await s('900000050258', '900000050259'), 'Am Fischtal & Im Gestell')
	t.notOk(await s('900000053101', '900000053171'), 'Glienicker Lake & Schloss Glienicke')
	t.notOk(await s('900000320860', '900000320870'), 'Strausberg: Treuenhof & Steuerhaus')
	t.notOk(await s('900000085150', '900000085154'), 'Brusebergstr. & Lübener Weg')
	t.notOk(await s('900000007155', '900000007111'), 'Gleimstr. & Lortzingstr.')

	t.end()
})
