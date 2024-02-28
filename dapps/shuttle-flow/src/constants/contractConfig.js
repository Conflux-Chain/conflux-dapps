/**
 * Config of All Contract used by Shuttle
 */
import {
  KeyOfEth,
  KeyOfBsc,
  KeyOfOec,
  KeyOfBtc,
  KeyOfHeco,
  KeyOfMetaMask,
  KeyOfPortal,
} from './chainConfig'
import {
  DepositRelayer_ABI,
  DepositRelayer_CFX_ABI,
  CustodianImpl_ABI,
  CustodianImplReverse_ABI,
  TokenSponsor_ABI,
  TokenSponsorReverse_ABI,
  Balance_ABI,
  TokenBase_ABI,
} from '../abi'
import {IS_DEV} from '../utils'

export const ContractType = {
  depositRelayer: 'depositRelayer',
  depositRelayerCfx: 'depositRelayerCfx',
  custodianImpl: 'custodianImpl',
  custodianImplReverse: 'custodianImplReverse',
  tokenSponsor: 'tokenSponsor',
  tokenSponsorReverse: 'tokenSponsorReverse',
  balance: 'balance',
  tokenBase: 'tokenBase',
}

export const ContractConfig = {
  [ContractType.depositRelayer]: {
    wallet: KeyOfMetaMask,
    abi: DepositRelayer_ABI,
    address: {
      [KeyOfEth]: IS_DEV
        ? '0x2f9bd2eeb09a006adf39a33b8782aaf4c7c84b63'
        : '0x02a9656f6851527e2199ce0ad3c15adddbaf734f',
      [KeyOfBsc]: IS_DEV
        ? '0x95edfd5fd720ace4cd585a469e5d8f12a448e27c'
        : '0x50468a03643ae9664c3c40b2bdcd4ebc8a6bc1f3',
      [KeyOfOec]: IS_DEV
        ? '0x5cF9C20DE32aE58d33Cb8C22e73d9b2B2E886AdA'
        : '0x214c2958C04150846A442A7b977F9f190B603F31',
      [KeyOfHeco]: IS_DEV
        ? '0x88b12D209D69B87ff762a5Bc7E9784138A825470'
        : '0xC09b68f33e37efE8545c6C2b5F9643d78f39EDdf',
    },
  },
  [ContractType.depositRelayerCfx]: {
    wallet: KeyOfPortal,
    abi: DepositRelayer_CFX_ABI,
    address: {
      [KeyOfEth]: IS_DEV
        ? 'cfxtest:accfj95y44gfbcsa8nfk98u2dcydt5j0825cevrxv2'
        : 'cfx:acesn0rpwutkb0ex9cghm91rs4dj60szk6ayzcm9aw',
      [KeyOfBsc]: IS_DEV
        ? 'cfxtest:acau4v7hac8r01h659u2m525dg5w0391pjb406f0m2'
        : 'cfx:acbsxck3mt6tdcxpbnxunx3wy29fy5k5m6d5cnmpy4',
      [KeyOfOec]: IS_DEV
        ? 'cfxtest:acd2cgm2f7yph27ycsyes1zg45yysccfna5dsm18jc'
        : 'cfx:acg8v55scuua60xcfheggkr5cry179kx0ef6gjcs64',
      [KeyOfHeco]: IS_DEV
        ? 'cfxtest:achnupbx4henxnyngtj9wga3jhsbycabyuh9xyzzb2'
        : 'cfx:acbjyjn1t6hhnxs3rwhbwc357tefmvx772pyc5zk82',
    },
  },
  [ContractType.custodianImpl]: {
    wallet: KeyOfPortal,
    abi: CustodianImpl_ABI,
    address: {
      [KeyOfEth]: IS_DEV
        ? 'cfxtest:ace863dsv5evux88atmmr735y023vyd3sufutajna1'
        : 'cfx:aceu6t9m2wvpgtnzww8f13vstf2s8zeb6a4eja1756',
      [KeyOfBtc]: IS_DEV
        ? 'cfxtest:ace863dsv5evux88atmmr735y023vyd3sufutajna1'
        : 'cfx:aceu6t9m2wvpgtnzww8f13vstf2s8zeb6a4eja1756',
      [KeyOfBsc]: IS_DEV
        ? 'cfxtest:acg8g810ntrv2wn62mjd7jn8brackkcc6pxv3u47ae'
        : 'cfx:acb3gfhjazfbxtajmfm1x5vc12drvs382ew0ykwyv8',
      [KeyOfOec]: IS_DEV
        ? 'cfxtest:achs3f2knh85024646aex8j226y96ynukesc46s63h'
        : 'cfx:acfscwx5sr9yfasnypgdmujc71gt66sajpzr0mhzpz',
      [KeyOfHeco]: IS_DEV
        ? 'cfxtest:acf0kuzpw0tt1664nutm1kcysd817r5yk6upe0eayn'
        : 'cfx:ace35sf1y803zm3pwypef5mjmy5hjjxbeas9ddtgad',
    },
  },
  [ContractType.custodianImplReverse]: {
    wallet: KeyOfPortal,
    abi: CustodianImplReverse_ABI,
    address: {
      [KeyOfEth]: IS_DEV
        ? 'cfxtest:acb13s4261puun56amtwzfy0u8vft0apsph8hu7g61'
        : 'cfx:acfphjkmvy23zww7tpzrrxp3hrs6r70bbyke5zfb5z',
      [KeyOfBsc]: IS_DEV
        ? 'cfxtest:acdbc6vygv2rcejrf59rga0b1ze52h94by3en9b77n'
        : 'cfx:acfgmctw40vy2a608uey5g9t32b8m4kp1268zwhrh1',
      [KeyOfOec]: IS_DEV
        ? 'cfxtest:acbsbs2cp9secres4kfd3zvwbp42zrr4fee3unj3bz'
        : 'cfx:acf0xp9vrv55gkft3tjntkjagvwme19vcu2wsj39fz',
      [KeyOfHeco]: IS_DEV
        ? 'cfxtest:acctjyr5sxgzmt3x4n620jxdffp0jz4r6e8fggvpnb'
        : 'cfx:acaw4z5bdgd0np0rukp7wjw7kwkan9xfdaxgms0mp6',
    },
  },
  //actually the tokenSponsor contract is no longer usefull after claim feature,but keep it for a short time
  [ContractType.tokenSponsor]: {
    wallet: KeyOfPortal,
    abi: TokenSponsor_ABI,
    address: {
      [KeyOfEth]: IS_DEV
        ? 'cfxtest:achw291k5c4yd8r2efdxz1w6z5n5y8hddernmat51y'
        : 'cfx:acfbfhg8bk3u9pf26rm8h2pmmru7csfkna4pfvy6ac',
      [KeyOfBtc]: IS_DEV
        ? 'cfxtest:achw291k5c4yd8r2efdxz1w6z5n5y8hddernmat51y'
        : 'cfx:acfbfhg8bk3u9pf26rm8h2pmmru7csfkna4pfvy6ac',
      [KeyOfBsc]: IS_DEV
        ? 'cfxtest:aca2kmezyet575cusyzhhp2jmwc1b4ka1ynevxeycf'
        : 'cfx:acfet2rcf4uag2daavzrsddkkvefpz4wmp1n76msw4',
      [KeyOfOec]: IS_DEV
        ? 'cfxtest:aca6tuc7cyarypp9ht8tkh34suuasv7uz6myay066j'
        : 'cfx:acc3zs32wsn06b5betf8g1g1phb7cg24xpbfjnfg7j',
    },
  },
  //actually the tokenSponsor contract is no longer usefull after claim feature,but keep it for a short time
  [ContractType.tokenSponsorReverse]: {
    wallet: KeyOfPortal,
    abi: TokenSponsorReverse_ABI,
    address: {
      [KeyOfEth]: IS_DEV
        ? 'cfxtest:acbjrt1zdnpf8xxknmxg2wruu1fbbagv5uawx0s1pk'
        : 'cfx:ach579brthtn13szzxzxcjsn6bt1vbdr4p8sej5eex',
      [KeyOfBsc]: IS_DEV
        ? 'cfxtest:acgw7pkuhvb8nk1a98jjzveugn7bkhj9za79hgwu4p'
        : 'cfx:aceftme5ycg8zj0gw71b3r1kurzpmhpn92ka1x565t',
      [KeyOfOec]: IS_DEV
        ? 'cfxtest:acfkp578z73dhecgprf8n4rd9g4751049yd75xun65'
        : 'cfx:acghjp9u0s4kgbars93dun5kftjhe1xjre3fa6smv4',
    },
  },
  [ContractType.balance]: {
    wallet: KeyOfPortal,
    abi: Balance_ABI,
    address: IS_DEV
      ? 'cfxtest:achxne2gfh8snrstkxn0f32ua2cf19zwkyw9tpbc6k'
      : 'cfx:achxne2gfh8snrstkxn0f32ua2cf19zwky2y66hj2d',
  },
  [ContractType.tokenBase]: {
    wallet: KeyOfPortal,
    abi: TokenBase_ABI,
    address: '',
  },
}
