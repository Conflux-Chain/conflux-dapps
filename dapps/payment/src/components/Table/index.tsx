import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { TableProps } from 'antd/es/table'
import { Table, Row, Col, Input } from 'antd'

const { Search } = Input;

interface Props extends TableProps<any> {
    search?: boolean;
    extra?: React.ReactNode
}

export default ({ dataSource = [], extra, search, ...others}: Props): React.ReactElement => {
    const dataCacheRef = useRef(dataSource);
    const [data, setData] = useState(dataSource);

    useEffect(()=>{
        dataCacheRef.current = dataSource;
        setData(dataSource)
    }, [dataSource])

    const onSearch = useCallback(
        (value: string) =>
            setData(
                dataCacheRef.current.filter((d) => d.name.includes(value) || d.baseURL.includes(value) || d.address.includes(value) || d.owner.includes(value))
            ),
        []
    );

    return (
        <div>
            <Row gutter={12}>
                <Col span="8">
                    { search && <Search placeholder="Search APP name, BaseURL, APP Address, Owner" allowClear enterButton="Search" size="small" onSearch={onSearch} /> }
                </Col>
                <Col span="16">
                    {extra}
                </Col>
            </Row>
            { (search || extra) && <div className='mt-4'></div> }
            <Table {...others} dataSource={data} />
        </div>
    );
};
