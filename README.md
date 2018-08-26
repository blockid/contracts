# Block ID Solidity Contracts

## Installation

```bash
$ git clone git@github.com:blockid/contracts.git
$ cd ./contracts
$ npm i
```

## Configuration via `.envrc`

`test` environment:

```bash 
$ echo export TEST_MNEMONIC="<your 12 mnemonic seed phrase>" > .envrc
$ echo export TEST_ENDPOINT="<rpc node endpoint e.g http://localhost:8545/>" >> .envrc

$ direnv allow
```

`prod` environment:

```bash 
$ echo export PROD_MNEMONIC="<your 12 mnemonic seed phrase>" > .envrc
$ echo export PROD_ENDPOINT="<rpc node endpoint e.g https://rinkeby.infura.io/>" >> .envrc
$ echo export PROD_ENS_ADDRESS="<ens address>" >> .envrc
$ echo export PROD_ENS_LABEL="<ens label e.g blockid>" >> .envrc
$ echo export PROD_ENS_ROOT_NODE="<ens root node e.g test>" >> .envrc

$ direnv allow
```

## Commands

```bash
$ npm run compile:test    # compiles contracts (test env)
$ npm run migrate:test    # migrates contracts (test env)
$ npm run migrate:prod    # migrates contracts (prod env)
$ npm test                # runs truffle tests
$ npm run test:node       # starts local test node
```

## Testing

Start test node:
 
```bash
$ npm run test:node
```

Run tests:

```bash
$ npm test
```

## Contract addresses

**MainNet:**

(not deployed yet)

**Ropsten:**

(not deployed yet)

**Rinkeby:**

(not deployed yet)

**Kovan:**

(not deployed yet)

**Local test node:**

| Contract Name 	| Address 	|
|--------------------	|----------------------------------------------	|
| `ENSMock` 	| `0xd373171f3f9b3da8552287174583dd57843c7002` 	|
| `ENSRegistrarMock` 	| `0x29c7ab991d282fc7ebab881443c4ddb9e78c3f53` 	|
| `ENSResolver` 	| `0xf8eb936a7f20dd4d6ecfaeb6aa68218e17cf316c` 	|
| `Registry` 	| `0x8c806655cc7a816e01a7c0719c0057f7d96f28cd` 	|

## License

MIT