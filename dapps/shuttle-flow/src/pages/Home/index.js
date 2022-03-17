import {useEffectOnce} from 'react-use'
import {useTranslation} from 'react-i18next'
import {
  BaseCenter,
  BaseLeft,
  BaseRight,
  ShuttleFlow,
  TokenLeft,
  SfCenter,
  TokenRight,
  // Twitter,
  // Telegram,
  // Discord,
  // Medium,
  // GitHub,
  LightLeft,
  LightRight,
  LightCenter,
  LightTunnel1,
  LightTunnel2,
  PipleLeft,
  PipleRight,
  TunnelLeft,
  TunnelRight,
  BaseMobile,
  ShuttleFlowMobile,
} from '../../assets/img'
import {Button} from '../../components'
import {useIsMobile} from '../../hooks'
import whitePaperEN from '../../assets/pdf/SF-whitepaper-en-v1.0.pdf'
import whitePaperZH from '../../assets/pdf/SF-whitepaper-zh-v1.0.pdf'

function Home() {
  useEffectOnce(() => {
    const classList = document.querySelector('body').classList
    classList.remove('dark')
    classList.remove('light')
    classList.add('home')
  })
  const {i18n, t} = useTranslation()
  const {language} = i18n
  const onOpenApp = () => {
    window.open('/shuttle')
  }
  const isMobile = useIsMobile()
  const copyright = (
    <span className="inline-block text-gray-40 text-xs py-4 md:py-0 md:h-4">
      © 2021 ShuttleFlow. All Rights Reserved.
    </span>
  )
  // const icon = (
  //   <div className="flex pb-6 md:pb-0">
  //     <a
  //       className="mr-4"
  //       href="https://twitter.com/@Conflux_Network"
  //       rel="noreferrer"
  //       target="_blank"
  //     >
  //       <img src={Twitter} alt="twitter" />
  //     </a>
  //     <a
  //       className="mr-4"
  //       href="https://t.me/Conflux_English"
  //       rel="noreferrer"
  //       target="_blank"
  //     >
  //       <img src={Telegram} alt="telegram" />
  //     </a>
  //     <a
  //       className="mr-4"
  //       href="https://discord.com/invite/aCZkf2C"
  //       rel="noreferrer"
  //       target="_blank"
  //     >
  //       <img src={Discord} alt="discord" />
  //     </a>
  //     <a
  //       className="mr-4"
  //       href="https://medium.com/@ConfluxNetwork"
  //       rel="noreferrer"
  //       target="_blank"
  //     >
  //       <img src={Medium} alt="medium" />
  //     </a>
  //     <a
  //       href="https://github.com/conflux-chain"
  //       rel="noreferrer"
  //       target="_blank"
  //     >
  //       <img src={GitHub} alt="github" />
  //     </a>
  //   </div>
  // )
  const line = <div className="border-solid border-t border-gray-20" />

  return (
    <div className="w-full relative md:h-screen md:min-h-220">
      <div className="md:w-360 mx-auto">
        <div className="ml-4 md:ml-20">
          <img
            className="mt-14 md:hidden"
            src={ShuttleFlowMobile}
            alt="title"
          />
          <img
            className="hidden md:block w-160 pt-24"
            src={ShuttleFlow}
            alt="title"
          />
          <span className="inline-block text-gray-60 mt-2 text-base md:mt-9 md:text-xl">
            {t('home.subTitle')}
          </span>
          <div className="flex mt-11 md:mt-9">
            <Button className="mr-6" onClick={() => onOpenApp()} id="openApp">
              {t('home.shuttleFlow')}
            </Button>
            <Button id="openPaper">
              <a
                rel="noreferrer"
                href={language === 'en' ? whitePaperEN : whitePaperZH}
                target="_blank"
              >
                {t('home.lightPaper')}
              </a>
            </Button>
          </div>
        </div>
        {isMobile && (
          <img className="mt-8 w-full" src={BaseMobile} alt="base" />
        )}
        {!isMobile && (
          <div className="relative">
            <div className="absolute left-240 top-30">
              <img className="w-64" src={TunnelRight} alt="tunnel" />
            </div>
            <svg
              className="absolute w-80 h-52 left-232 top-24"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <image
                className="w-4 h-4"
                href="https://conflux-static.oss-cn-beijing.aliyuncs.com/shuttleflow-img/token-n-right.png"
              >
                <animateMotion
                  dur="10s"
                  repeatCount="indefinite"
                  path="M0,160 Q110,118 200,25 Q110,118 0,160"
                />
              </image>

              <image
                className="w-4 h-4"
                href="https://conflux-static.oss-cn-beijing.aliyuncs.com/shuttleflow-img/token-n-right.png"
              >
                <animateMotion
                  dur="11s"
                  repeatCount="indefinite"
                  path="M0,160 Q110,118 200,25 Q110,118 0,160"
                />
              </image>

              <image
                className="w-4 h-4"
                href="https://conflux-static.oss-cn-beijing.aliyuncs.com/shuttleflow-img/token-n-right.png"
              >
                <animateMotion
                  dur="12s"
                  repeatCount="indefinite"
                  path="M0,160 Q110,118 200,25 Q110,118 0,160"
                />
              </image>
            </svg>
            <div className="absolute left-136 top-9">
              <img className="w-168" src={BaseCenter} alt="base" />
            </div>
            <div className="absolute left-260 top-2.5">
              <img className="w-110" src={BaseRight} alt="base" />
            </div>
            <div className="absolute left-65 top-60">
              <img src={TunnelLeft} alt="tunnel" />
            </div>

            <svg
              className="absolute left-44 top-48 w-132 h-52 "
              viewBox="0 0 200 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <image
                className="w-3 h-3"
                href="https://conflux-static.oss-cn-beijing.aliyuncs.com/shuttleflow-img/token-n-left.png"
              >
                <animateMotion
                  dur="10s"
                  repeatCount="indefinite"
                  path="M10,60 Q80,30 145,42 Q220,50 250,20 Q220,50 145,42 Q80,30 10,60 "
                />
              </image>

              <image
                className="w-3 h-3"
                href="https://conflux-static.oss-cn-beijing.aliyuncs.com/shuttleflow-img/token-n-left.png"
              >
                <animateMotion
                  dur="11s"
                  repeatCount="indefinite"
                  path="M10,60 Q80,30 145,42 Q220,50 250,20 Q220,50 145,42 Q80,30 10,60"
                />
              </image>

              <image
                className="w-3 h-3"
                href="https://conflux-static.oss-cn-beijing.aliyuncs.com/shuttleflow-img/token-n-left.png"
              >
                <animateMotion
                  dur="12s"
                  repeatCount="indefinite"
                  path="M10,60 Q80,30 145,42 Q220,50 250,20 Q220,50 145,42 Q80,30 10,60"
                />
              </image>
            </svg>
            <div className="absolute left-1 top-56">
              <img className="w-104" src={BaseLeft} alt="base" />
            </div>
            <div className="absolute left-48 top-48 animate-bounce">
              <img src={TokenLeft} alt="token" />
            </div>
            <div className="absolute left-192 top-4 animate-bounce">
              <img className="w-40" src={SfCenter} alt="sf" />
            </div>
            <div className="absolute left-302 -top-6 animate-bounce">
              <img src={TokenRight} alt="token" />
            </div>
            <div className="absolute left-40 top-52 animate-pulse-fast">
              <img src={LightLeft} alt="light" />
            </div>
            <div className="absolute left-154 -top-1 animate-pulse-fast">
              <img src={LightCenter} alt="light" />
            </div>
            <div className="absolute left-293 -top-1 animate-pulse-fast">
              <img src={LightRight} alt="light" />
            </div>
            <div className="absolute left-158 top-60 animate-pulse-fast">
              <img src={LightTunnel1} alt="light" />
            </div>
            <div className="absolute left-280 top-34 animate-pulse-fast">
              <img src={LightTunnel2} alt="light" />
            </div>
            <div className="absolute left-116 top-64">
              <img src={PipleLeft} alt="piple" />
            </div>
            <div className="absolute left-270 top-44">
              <img src={PipleRight} alt="piple" />
            </div>
          </div>
        )}
      </div>
      {!isMobile ? (
        <div className="absolute bottom-0 w-full">
          {line}
          <div className="flex justify-between items-center py-3 px-0">
            {copyright}
            {/* {icon} */}
          </div>
        </div>
      ) : (
        <div className="fixed bottom-0 w-full px-4">
          {/* {icon} */}
          {line}
          {copyright}
        </div>
      )}
    </div>
  )
}
export default Home
