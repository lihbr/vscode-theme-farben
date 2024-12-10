/* eslint-disable antfu/no-top-level-await */
import fsp from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

import monokai from "tm-themes/themes/monokai.json"
import { colors } from "./colors"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const monokaiColors = new Set<string>()
const monokaiString = JSON.stringify(monokai)

// Sync colors from Monokai theme
if (process.argv[0] === "--sync") {
	const hexalpha = /#(?:[0-9a-f]{3}){1,2}(?:[0-9a-f]{2})?/gi
	while (true) {
		const match = hexalpha.exec(monokaiString)

		if (!match) {
			break
		}

		monokaiColors.add(match[0].toLowerCase())
	}

	const map = Object.fromEntries(
		[...monokaiColors].sort()
			.map((color) => [color, colors[color as keyof typeof colors] ?? ""]),
	)

	await fsp.writeFile(path.join(__dirname, "colors.json"), `${JSON.stringify(map, null, "\t")}\n`)
}

// Build theme
const farben = {
	...monokai,
	displayName: "Farben",
	name: "farben",
}

let farbenJson = JSON.stringify(farben, null, "\t")

for (const color in colors) {
	const newColor = colors[color as keyof typeof colors]

	if (!newColor) {
		process.exit(0)
	}

	farbenJson = farbenJson.replace(new RegExp(color, "gi"), newColor)
}

await fsp.writeFile(path.join(__dirname, "farben.json"), `${farbenJson}\n`)
