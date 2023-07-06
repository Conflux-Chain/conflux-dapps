/**
 * Choose the chain on Shuttle page
 */
import PropTypes from 'prop-types'
import {useState, useEffect} from 'react'

import {
  SupportedChains,
  KeyOfCfx,
  ChainConfig,
} from '../../../constants/chainConfig'
import {Menu, Dropdown} from '../../../components'
import {ArrowDownOutlined} from '../../../assets/svg'
import {ChainItem} from '../../components'

function ChainSelect({type, chain, fromChain, onClick, disabled = false, ...props}) {
  const chainsData = useChainsData(type, chain, fromChain)
  const onClickHandler = key => {
    if(disabled) return
    onClick && onClick(key, type)
  }
  const menu = (
    <Menu>
      {chainsData.map(item => (
        <Menu.Item
          itemKey={item.key}
          key={item.key}
          onClick={onClickHandler}
          selected={item.selected}
          disabled={item.disabled}
          icon={item.icon}
        >
          {item.name}
        </Menu.Item>
      ))}
    </Menu>
  )

  return (
    <Dropdown overlay={menu} disabled={disabled} placement="bottomLeft" trigger={['click']}>
      <div
        className={`p-3 mr-3 flex items-center justify-between ${!disabled ? 'cursor-pointer' : ''} w-[240px]`}
        aria-hidden="true"
        {...props}
      >
        <ChainItem chain={chain} />
        <ArrowDownOutlined className={`w-4 h-4 text-gray-60 ${!disabled ? '' : 'invisible'}`} />
      </div>
    </Dropdown>
  )
}

ChainSelect.propTypes = {
  type: PropTypes.oneOf(['from', 'to']).isRequired,
  chain: PropTypes.oneOf(SupportedChains).isRequired,
  fromChain: PropTypes.oneOf(SupportedChains), // only when type === to need the value
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
}

export default ChainSelect

/**
 * get the data that will show in the Chain Dropdown list
 * @param {*} type
 * @param {*} chain
 * @param {*} fromChain
 */
function useChainsData(type, currentChain, fromChain) {
  const [chains, setChains] = useState([])
  useEffect(() => {
    let chainArr = []
    switch (type) {
      case 'from':
        SupportedChains.forEach(chainName => {
          const chain = ChainConfig[chainName]
          let item = {}
          item.key = chain.key
          item.name = chain.fullName
          item.icon = chain.icon('!h-6 !w-6')
          item.disabled = false
          if (chainName === currentChain) {
            item.selected = true
          } else {
            item.selected = false
          }
          chainArr.push(item)
        })
        break
      case 'to':
        SupportedChains.forEach(chainName => {
          const chain = ChainConfig[chainName]
          let item = {}
          item.key = chain.key
          item.name = chain.fullName
          item.icon = chain.icon('!h-6 !w-6')
          if (fromChain !== KeyOfCfx) {
            if (chainName !== KeyOfCfx) {
              item.disabled = true
            } else {
              item.disabled = false
            }
          } else {
            if (chainName === KeyOfCfx) {
              item.disabled = true
            } else {
              item.disabled = false
            }
          }
          if (chainName === currentChain) {
            item.selected = true
          } else {
            item.selected = false
          }
          chainArr.push(item)
        })
        break
    }
    setChains(chainArr)
  }, [type, currentChain, fromChain])
  return chains
}
