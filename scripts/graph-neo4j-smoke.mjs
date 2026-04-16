import neo4j from 'neo4j-driver'

const uri = process.env.NEO4J_URI?.trim() || 'bolt://127.0.0.1:7687'
const user = process.env.NEO4J_USER?.trim() || 'neo4j'
const password = process.env.NEO4J_PASSWORD?.trim() || 'review-games-dev'
const database = process.env.NEO4J_DATABASE?.trim() || 'neo4j'

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
const session = driver.session({ database, defaultAccessMode: neo4j.session.READ })

try {
  const result = await session.run('RETURN 1 AS ready, $database AS database', { database })
  const record = result.records[0]
  if (!record || record.get('ready')?.toNumber?.() !== 1) {
    throw new Error('Neo4j smoke check returned an unexpected result.')
  }

  console.log(`Neo4j smoke check passed for ${uri} (${database}).`)
} catch (error) {
  console.error('Neo4j smoke check failed.')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await session.close()
  await driver.close()
}

