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

$ direnv allow
```

`prod` environment:

```bash 
$ echo export PROD_MNEMONIC="<your 12 mnemonic seed phrase>" > .envrc
$ echo export PROD_ENDPOINT="<rpc node endpoint e.g https://rinkeby.infura.io/>" >> .envrc
$ echo export PROD_ENS_ADDRESS="<ens address>" >> .envrc
$ echo export PROD_ENS_LABELS="<ens labels e.g blockid,examples splited by ,>" >> .envrc
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

## License

MIT