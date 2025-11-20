#!/bin/bash
set -e

# Generate application.properties from environment variables
cat > /app/application.properties << 'PROPERTIES_EOF'
# Generated from environment variables at runtime
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

store.cardano.protocol-magic=${STORE_CARDANO_PROTOCOL_MAGIC:-2}
store.cardano.host=${STORE_CARDANO_HOST:-preview-node.play.dev.cardano.org}
store.cardano.port=${STORE_CARDANO_PORT:-3001}
store.cardano.n2n-host=${STORE_CARDANO_HOST:-preview-node.play.dev.cardano.org}
store.cardano.n2n-port=${STORE_CARDANO_PORT:-3001}

store.governance.enabled=true
store.staking.enabled=true
store.transactions.enabled=true
store.blocks.enabled=true
store.metadata.enabled=true
store.utxo.enabled=true
store.assets.enabled=false
store.epoch.enabled=true

store.parallel-processing=${STORE_PARALLEL_PROCESSING:-true}
store.virtual-threads-enabled=${STORE_VIRTUAL_THREADS_ENABLED:-true}

logging.level.com.bloxbean.cardano.yaci=INFO
logging.level.com.bloxbean.cardano.yaci.store=INFO
PROPERTIES_EOF

# Substitute environment variables
envsubst < /app/application.properties > /app/application.properties.tmp
mv /app/application.properties.tmp /app/application.properties

echo "Starting Yaci Store with configuration:"
cat /app/application.properties | grep -v password | grep -v "spring.datasource.password"

exec java -jar /app/yaci-store.jar

