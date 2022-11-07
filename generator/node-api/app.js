const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs-extra');
// const solc = require('solc');
const cors = require('cors');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require("keccak256");
const bodyparser = require("body-parser");



const app = express();
app.use(cors({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE"
  }));
  
// const sslServer = https.createServer(
//     {
//       key: fs.readFileSync(path.join('ssl','private.key')),
//       cert: fs.readFileSync(path.join('ssl','certificate.crt')),
//     },
//     app
//   )

// support parsing of application/json type post data
app.use(bodyparser.json());
// parse request to body-parser
app.use(bodyparser.urlencoded({ extended: true }))

app.listen(5550,() => console.log('RUNING SSL NODE ON AWS ON PORT 443...'));
  

const getContractSource = contractFileName => {
    const contractPath = path.resolve(__dirname, 'contracts', contractFileName);
    return fs.readFileSync(contractPath, 'utf8');
};

async function compile(){
    const sourceFolderPath = path.resolve(__dirname, 'contract-files');
    const buildFolderPath = path.resolve(__dirname, 'build');
    let sources = {};

    var walk = function (dir) {
        var results = [];
        var list = fs.readdirSync(dir);
        list.forEach(function (file) {
            file = dir + '/' + file;
            var stat = fs.statSync(file);
            if (stat && stat.isDirectory()) {
                results = results.concat(walk(file));
            } else {
                if (file.substr(file.length - 4, file.length) === ".sol") {
                    sources = {
                        ...sources,
                        [file]: {
                            content: getContractSource(file)
                        }
                    };
                }
                results.push(file);
            }
        });
        return results;
    };
    walk(sourceFolderPath);

    const input = {
        language: 'Solidity',
        sources,
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            },
            

            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    }

    console.log('\nCompiling contracts...');
    const output = JSON.parse(solc.compile(JSON.stringify(input)));


    let shouldBuild = true;

    if (output.errors) {
        console.error(output.errors);
        // throw '\nError in compilation please check the contract\n';
        for (error of output.errors) {
            if (error.severity === 'error') {
                shouldBuild = false;
                throw 'Error found';
                break;
            }
        }
    }

    if (shouldBuild) {
        fs.removeSync(buildFolderPath);
        fs.ensureDirSync(buildFolderPath);

        for (let contractFile in output.contracts) {
            for (let key in output.contracts[contractFile]) {
                fs.outputJsonSync(
                    path.resolve(buildFolderPath, `${key}.json`),
                    {
                        abi: output.contracts[contractFile][key]["abi"],
                        bytecode: output.contracts[contractFile][key]["evm"]["bytecode"]["object"]
                    },
                    {
                        spaces: 2,
                        EOL: "\n"
                    }
                );
            }
        }
        // res.status(200).send({success:true})
    } else {
        console.log('\nBuild failed\n');
    }
};
// compile();

app.get('/erc721ByteCode', async(req,res)=>{
    let fileName = req.query.file;
    let data = fs.readFileSync(`./build/${fileName}.json`, 'utf8');
    console.log(data);
    let data1 = JSON.parse(data);
    console.log(data1.abi)
    res.status(200).send({success:true, abi: data1.abi, bytecode:data1.bytecode})
});

app.get('/getMerkleRoot', async (req, res) => {
    let whitelist = req.query.data;
    let buildFolderPath = path.resolve(__dirname, 'whitelist');
    let leaves = JSON.parse(whitelist).map((addr) => keccak256(addr))
    let merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true })
    let rootHash = merkleTree.getHexRoot();
    fs.outputJsonSync(path.resolve(buildFolderPath, `${rootHash}.json`),JSON.parse(whitelist));
    res.status(200).send({ success: true, data: rootHash })
});

app.get('/getMerkleProof', async (req, res) => {
    let merkle = req.query.merkle;
    let address = req.query.address;
    let data = fs.readFileSync(`./whitelist/${merkle}.json`, 'utf8');   
    let whitelistAddresses = JSON.parse(data);
    console.log("whitelistAddresses", whitelistAddresses)
    let leaves = whitelistAddresses.map(addr => keccak256(addr))
    let merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true })
    let hashedAddress = keccak256(address)
    let proof = merkleTree.getHexProof(hashedAddress);
    res.status(200).send({ success: true, data: proof })
})

app.get('/test', async(req,res)=>{
    let address = "0xFff7d76AaCcD0707a896694804030aFdB7eb9e3d" // The input
    let whitelistAddresses = ['0xFff7d76AaCcD0707a896694804030aFdB7eb9e3d',
    '0x2568870dcb03b41fa858f20e089e722003b224f8',
    '0x782d3b9009fb39570dd736f1a7abc963e9d84726',
    '0xcff3d72c6a163c97390783a7d6a47c7dfbf44968',
    '0x260fec28ab193b84c3cf4a79ec7fc9bce31b0a74',
    '0xb187304fe6bc8f0b14fa8089248fd66ca04577d9',
    '0x8c623c4de9e51dbe98a3c5fa298e03667a3c3149',
    '0x4fa84e7546be0506b9fcf035d44339a5be75dd6f',
    '0x89a703a20edf5056cc97481ee724e265a1ef9270',
    '0x81391a072906ab5edc4134cf6187a799c93aa7c0',
    '0x84b340b0f841321a19d6ac7e1de4d04b448b7e3c',
    '0xcc1f12737347068bb58bf7a6713d6c97ff91c9e5',
    '0xe6b45aecd73dd95d43d5bece2f188936cb62c9cf',
    '0x96f496233cd31edf2f792094292d10a24b51f7d9',
    '0x0450f6c39154ff7f20b6a1465c2307db31c4bf30',
    '0x09d20c49e61352ef202ce87f6a02324b614a8cca',
    '0x0c5b0fc97c55153b3374a886557ee4c380373dfe',
    '0xfc36e7f8871318f2dc17de1423f5ed26d4f0809d',
    '0xd3ef06387dafb965dd35912aaf15e281f2cb2532',
    '0x1714c8bdeb4d79a98b3ac0647e03972d9120c856',
    '0x6c25eab478e0593d3378db7203a67e6f1e557410',
    '0xefd09cf71a55fc1097438adec6f2b104ed76313b',
    '0x79a45d79be6f20e8d1cb6fd2e3960d0436331a24',
    '0x3a4fde9d0b86f20886e21edf27a0b5baa3150ab4',
    '0xd995931e1fb1cf5443ecf348b4463f96e652c78b',
    '0x322d34f1c1184d6d314c899f6cc9f4396cc2d15a',
    '0xa8877a5064fed35656e6b6779ed5dfe997914284',
    '0xa595d28f74c9eda4e8b5c4fe6e7789da2144375c',
    '0xe74b82f2d9396396d865d4d385afb7b31967835c',
    '0xefe65540f03991f8dea4dd5fc6ffe98a9d504cca',
    '0x9fd4ed936dd467fcd79ee96f62e1dac429cdb930',
    '0x4a09b4ebf252346c649b33c406ab7ca9bca770a1',
    '0xbb2b0feb0da23a3ea57acaa1ef28466cf09f9d03',
    '0xdef8755d7e0f439d53c9653b3c9943889726030c',
    '0xf5d316ae22e19222e63fa257e7c53494607e6f77',
    '0xe1bbcddbb7cbc503f195eb245eb7cce05438d31e',
    '0x5deafe938336aea976f3d9e22e6f60d8b414c889',
    '0x0aa19fea75f959674bfc3310a7328a434413af6d',
    '0x96a0212d867937402dd851142127f55726f975d8',
    '0xa1591a7c017ddf2c66e4da6d334342087eab8ded',
    '0x7a6a824479391b4537b370e679c2cbdcc35fd75a',
    '0xc48320e1aa0bd0bb802e1297b1878139273d96ed',
    '0xb90eb8db0529b9d99c0eb4092da2699d670d4a6a',
    '0x1b52c078d90d5c085f0eda8fcd14ebfa2d24bf67',
    '0x1831d039a9111942cbcaaf56d4f92b06e5ada76c',
    '0xd491796069d6e0f2d03e6e91d096dd2c042b7a93',
    '0x5c4923cd2276129521385f1598c1764d2cf5a1c5',
    '0x35762495c7c3532fed0e27bdea4a7c46f18e4b77',
    '0x7f49c2a06ceea673f3ace497653a8be4b32e2871',
    '0x52636db4de9f31692f41f92ca0419922747698a9',
    '0x14344e0970f07606101e58e320ad6fc86d9ded91',
    '0x570652c7b6594b22936b340ee76d1842a3f2fcf9',
    '0xe1615200e0d4ccb86fe4ce87b570d129fd5516b2',
    '0x6a7e63e8e874484d3e34731b788c603f3813383d',
    '0x425739267bd7e20663e47e2157621629cafa80cd',
    '0x9d47d133bd645a5243b2783e8e0c8679099db9b9',
    '0xb7031fdd407cca9c12775016a4acb8433d6c9046',
    '0x5702b8ebe346ccaf49b1b3e720198ae6763d2f21',
    '0xd5b8c14a333d4eb79c877ec3de65f9f7210babcf',
    '0x47c5b921a4f2c053c6dcb83c7c1af5fd99eaaf49',
    '0xda2673bfe9377f21bb5024f1bc7ba8e432e6b5f0',
    '0xaeb56b506d201b54bdeccbc5f2d9b302333d090d',
    '0x49dec1f169364588f4901a97d3f8088e16647228',
    '0x7e31943ce984248432322483a8522bf8bc85daf0',
    '0xd2b17d29258d7045355a691ec919cec8401abdb8',
    '0x5f8d554a433d61a274333adf8fd072f2f159a6c3',
    '0x443b17a4d770305f67e30e07ff7c357b9c8563ce',
    '0x55b3a052d3c2249326f2c2d88d8639f066eb62d5',
    '0xf63457334d172da5f6486b9dd69e929c83bdb3c5',
    '0xf621fb1845b43bf9ea2d37470ab0e488188d4afe',
    '0xf272641f13f4a63c6bbc1d2502f88b80ab743281',
    '0x8986b48d82a2e8487fa83a457bbbcd562f90a523',
    '0xcbe9b857c3c501d2db4596d4c5738fafd1f2b30f',
    '0x2aa2d28af836ff7bd17c52bdc286eca43459ce50',
    '0xfa5394a0e351db679db6640b0c989d1b4402748f',
    '0xf554941ec6366e63eb5da0836ccef4268dbcf7a1',
    '0xa9c7852175ad456861337037210e3423292212a7',
    '0xacb4f7aca99847a327aec61fe433623bd70898d8',
    '0x097ed35c1d18f0bbe807f156a70de74f431f287e',
    '0x942445e9174c01d4655103693e5410c12e22cd84',
    '0x066c621a73272cd83d59e1cf5b90ce2a5438068f',
    '0xaab46b2c0e6a6b9f000b6ef8dc39f6d410ca9e7d',
    '0xe5dfa3daa220e870c1a770780a4c064bf801fb8d',
    '0xed4f186b6dd515dfa8c429c2f7b46bfa7056c693',
    '0xa1c1df17540ec564e2a02e69933f1b2d7fa4c416',
    '0x953deea7b91bb80c32bf501490c9df02cd8ce9fa',
    '0xc6e02b6ac6ccb29018c970c64e35976c6a1796c3',
    '0x567a0621560624d00a5fc22fef4c5706389ab6a3',
    '0xae8a8eb8074fdeba485ef4cf0ec13d161727c7e0',
    '0xbe2c30371b7617bda98ad8922e8fd063019d258d',
    '0x28e6c30953c89bcf77beabd1924c2490425ee998',
    '0x3246e18913197025ea47740ebce69402436dd7df',
    '0xdff74ae0f3572765c921738662419c1ab0500a7f',
    '0xbe39ad73b0b4a536a40dd803d12c0c95970586d9',
    '0xe8fa19be49bda8be16f9c69d4f703e021774be48',
    '0x0b9eedeb8f7a61a62e6ba26afeddf267f02c62f6',
    '0x70a1ec9ab8fb317d73fcbd6f6a5ef222deba2d2d',
    '0x72c60e25196248757bce89daa079c5f3223226e4',
    '0x66e2d2612a55e0e7ebece4dbb433ec5400b68a40',
    '0x48fD940cEB1f0Fb90c94Ead339eC8DcAadE7dFDE',
    '0xb7dE241d7E6f64CcBea73eECDbD91E949A7461dd',
    '0x39225f9225735Cbdff9ad05559750190f7a2F30a',
    '0x87aA582AB2d8E296CC678cADAf58f7367eb84f45',
    '0xC7cD4Fd6939f58119994d5f1dB00AB5Ac517575f',
    '0x1Dac9dB572528fc9ae3aFE4c0A449Be53Eb98e86',
    '0x4252B870f933D501D4E03daB1f8e2b167A666F96',
    '0x722AE2062DC0891A359FAb95c808AcD434a89e10'
];
    let leaves = whitelistAddresses.map(addr => keccak256(addr))
    let merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true })
    let hashedAddress = keccak256(address)
    let proof = merkleTree.getHexProof(hashedAddress);
    res.status(200).send({success:true, data:proof})

})

app.get('/', (req, res) => {
    res.status(200).send({ success: true, msg: "API is working" });
});

app.listen(4000, () => { console.log(`Server is running on http://localhost:${4000}`) });