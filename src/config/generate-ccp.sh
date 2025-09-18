#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        ./ccp-template.json
}


const basePath1 = path.resolve(__dirname, '../../../../HLF/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com');
const basePath2 = path.resolve(__dirname, '../../../../HLF/fabric-samples/test-network/organizations/peerOrganizations/org2.example.com');


const peerpemOrg1 = path.join(basePath1, 'peers/peer0.org1.example.com/tls/tlscacerts/tls-localhost-7054-ca-org1.pem');
const peerpemOrg2 = path.join(basePath2, 'peers/peer0.org1.example.com/tls/tlscacerts/tls-localhost-7054-ca-org2.pem');
const capemOrg1 = path.join(basePath1, 'msp/tlscacerts/ca.crt');
const capemOrg2 = path.join(basePath2, 'msp/tlscacerts/ca.crt');

if (!fs.existsSync(peerpemOrg1)) {
    console.error("Peer PEM file not found:", peerpemOrg1);
}

if (!fs.existsSync(capemOrg1)) {
    console.error("CA PEM file not found:", capemOrg1);
}

# Organization 1
ORG=1
P0PORT=7051
CAPORT=7054
PEERPEM=peerpemOrg1
CAPEM=capemOrg1

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > connection-org1.json

# Organization 2
ORG=2
P0PORT=9051
CAPORT=8054
PEERPEM=peerpemOrg2
CAPEM=capemOrg2

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > connection-org2.json
