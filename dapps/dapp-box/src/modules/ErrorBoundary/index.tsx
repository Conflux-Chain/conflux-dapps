import React from 'react';
import CustomScrollbar from 'custom-react-scrollbar';
import ErrorImg from 'hub/src/assets/error.svg';

class ErrorBoundary extends React.Component<any> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        this.setState({ error: String(error), errorInfo: String(errorInfo?.componentStack) });
    }

    render() {
        if ((this.state as any).hasError) {
            // 你可以自定义降级后的 UI 并渲染
            return (
                <div className='pt-[80px]'>
                    <img src={ErrorImg} alt='error' className='w-[68px] h-[68px] mx-auto mb-[16px]'/>
                    <h1 className='text-center text-[28px] text-[#E15C56] font-medium'>Unfortunately, some unexpected errors occurred!</h1>
                    <h2 className='text-center text-[20px] text-[#808BE7] font-medium'
                    >
                        You can resume using confluxhub by refreshing the page.
                    </h2>

                    {this.state.error &&
                        <>
                            <h3 className='mt-[40px] mb-[12px] text-center text-[18px] text-[#1B1B1C] font-medium'
                            >
                                And we hope you can recall the operation steps and send the following error message to the official channel together.
                            </h3>
                            <CustomScrollbar className='p-[24px] border-4 border-red-300 rounded-lg max-w-[80vw] text-[16px] leading-[18px] text-[#3D3F4C]'>
                                {this.state.error && <div className='mb-[12px]'>{this.state.error}</div>}
                                {this.state.errorInfo && <pre className=''>{this.state.errorInfo}</pre>}
                            </CustomScrollbar>
                        </>
                    }
                </div>
            );
        }

        return this.props.children;
    }
}


export default ErrorBoundary;