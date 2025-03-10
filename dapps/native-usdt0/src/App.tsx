import bgEmpowering from './assets/bgEmpowering.png';
import bgNative from './assets/bgNative.png';
import bgNativeMobile from './assets/bgNativeMobile.png';
import Bridge from './assets/Bridge.png';
import Convert from './assets/Convert.png';
import learnMore from './assets/learnMore.png';
import arrowUp from './assets/arrow-up.svg';
import arrow from './assets/arrow.svg';
import { useState, useEffect } from 'react';
import { isProduction } from 'common/conf/Networks';

interface EarnItem {
    icon: string;
    name: string;
    link?: string;
}

interface ConfigData {
    version: string;
    title: string;
    'get-usdt0-link': string;
    'bridge-usdt0-link': string;
    'learn-more-link': string;
    earn: EarnItem[];
}

const App = () => {
    const [config, setConfig] = useState<ConfigData | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const timestamp = Date.now();
                const env = isProduction ? 'main' : 'dev';
                const response = await fetch(`https://cdn.jsdelivr.net/gh/conflux-fans/ustd0-link@${env}/config.json?t=${timestamp}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data: ConfigData = await response.json();

                if (data) {
                    setConfig(data);
                }
            } catch (err: any) {
                console.error('Failed to fetch config:', err);
            }
        };

        fetchConfig();
        const rootEle = document.querySelector('#conflux-hub-root');
        if (rootEle) {
            rootEle.classList.add('root-no-px');
        }
    }, []);

    return (
        <div className="min-h-screen  relative">
            <div className="w-full hidden sm:block relative">
                <div className="w-full max-w-[700px] m-auto absolute left-0 right-0">
                    <img className="w-full absolute z-[9]" src={bgNative} alt="Empowering" />
                </div>

                <div className="w-full max-w-[450px] pt-[180px] m-auto  left-0 right-0">
                    <div className="w-[438px] text-[#3D3F4C] text-[38px] font-medium leading-[40px] relative z-[9] text-center">
                        Native <span className="text-[#00B988]">USDT0</span> Now Live Convert, Bridge, Earn
                    </div>
                    <div className="text-[#3D3F4C] text-[16px] pt-[16px] relative z-[9]">Empowering and Elevating the Conflux eSpace DeFi Ecosystem</div>
                </div>

                <div
                    className="w-full pb-[400px] [@media(min-width:1720px)]:pb-[25%] mb-[-50px] mt-[-100px] relative z-[9]"
                    style={{ backgroundImage: `url(${bgEmpowering})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
                ></div>

                <img className="w-[16px] mt-[-100px] absolute left-0 right-0 z-[9] m-auto " src={arrow} alt="arrow" />
            </div>

            <div className="w-full min-w-[375px] block sm:hidden pb-[30%]">
                <div className="w-full max-w-[450px] pt-[48%] m-auto absolute left-0 right-0">
                    <div className="w-full text-[#3D3F4C] text-[32px] font-medium leading-[40px] relative z-[9] text-center">
                        Native <span className="text-[#00B988]">USDT0</span> Now Live Convert, Bridge, Earn
                    </div>
                    <div className="text-[#3D3F4C] text-[14px] text-center pt-[16px] relative z-[9]">
                        Empowering and Elevating the Conflux eSpace DeFi Ecosystem
                    </div>
                </div>
                <img className="w-full absolute z-[8]" src={bgNativeMobile} alt="Empowering" />
            </div>

            <div className="w-full max-w-[1536px] mx-auto pt-[80%] sm:pt-0 px-4 flex flex-col md:flex-row gap-6 relative z-[9]">
                <div className="flex-1 bg-white rounded-2xl p-6 shadow-lg">
                    <div className="md:flex md:items-start">
                        <div className="flex mb-4 md:mb-0 ">
                            <img src={Convert} alt="Convert" className="w-[120px] h-[120px]" />
                        </div>
                        <div className="md:ml-4 md:flex-1 ">
                            <div className="text-[#3D3F4C] text-[24px] font-medium mb-2">Convert</div>
                            <div className="text-[#898D9A] text-[14px] mb-4">Convert your eSpace USDT to Native USDT0 effortlessly.</div>
                            <div className="">
                                <a href={config?.['get-usdt0-link'] || '#'} target="_blank">
                                    <button className="bg-[#00B988] text-white text-[16px] py-2 px-8 rounded-full transition-colors">Get USDT0</button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-6 shadow-lg">
                    <div className="md:flex md:items-start">
                        <div className="flex j mb-4 md:mb-0 md:justify-start">
                            <img src={Bridge} alt="Bridge" className="w-[120px] h-[120px]" />
                        </div>
                        <div className="md:ml-4 md:flex-1 ">
                            <div className="text-[#3D3F4C] text-[24px] font-medium mb-2">Bridge</div>
                            <div className="text-[#898D9A] text-[14px] mb-4">Seamlessly bridge your USDT0 anywhere.</div>
                            <div className="">
                                <a href={config?.['bridge-usdt0-link'] || '#'} target="_blank">
                                    <button className="bg-[#00B988] text-white text-[16px] py-2 px-8 rounded-full transition-colors">Bridge</button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-[1536px] mx-auto mt-8 px-4 relative z-[9]">
                <div className="">
                    <div className="text-[#3D3F4C] text-[24px] font-medium mb-2">Earn</div>
                    <div className="text-[#898D9A] text-[14px] mb-6">Utilize USDT0 in DeFi for maximum gains.</div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 [@media(min-width:321px)_and_(max-width:639px)]:grid-cols-2">
                        {config?.earn?.map((item, index) => (
                            <a
                                key={index}
                                className="bg-white rounded-xl p-6 flex items-center justify-between border border-gray-100 hover:border-[#00B988] hover:bg-[#f5fbf9] transition-colors cursor-pointer group"
                                href={item.link}
                                target="_blank"
                            >
                                <div className="flex items-center">
                                    <img src={item.icon} alt={item.name} className="w-8 h-8" />
                                    <div className="ml-3 text-[#3D3F4C] font-medium text-sm">{item.name}</div>
                                </div>
                                <div className="hidden group-hover:block">
                                    <img src={arrowUp} alt="arrow-up" className="w-5 h-5 text-[#00B988]" />
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full max-w-[1536px] mx-auto mt-12 px-4 relative z-[9] ">
                <div className="bg-[#2D2E36] rounded-2xl p-6 sm:p-12 shadow-lg flex flex-col-reverse lg:flex-row gap-2 justify-between">
                    <div className="flex-1 flex flex-col justify-between lg:py-10">
                        <div className="text-white text-[24px] font-medium mb-4">Tether's Innovative Stablecoin Technology</div>
                        <div className="text-[#A9ABB2] text-[16px] mb-6 font-thin lg:pr-[120px]">
                            USDT0 utilizes LayerZero's OFT Standard for deployment and asset transfers across new chains while ensuring a reliable 1:1 backing
                            with USDT.
                        </div>
                        <a href={config?.['learn-more-link'] || '#'} target="_blank">
                            <div className="inline-flex items-center bg-white text-[#3D3F4C] py-3 px-8 rounded-full">learn more</div>
                        </a>
                    </div>
                    <div className="flex-1 flex justify-center items-center">
                        <img src={learnMore} alt="Tether Technology" className="w-full" />
                    </div>
                </div>
            </div>

            <div className="w-full h-[1px] mt-[20px]"></div>
        </div>
    );
};

export default App;
