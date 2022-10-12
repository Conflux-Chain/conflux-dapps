import { useParams } from 'react-router-dom';
import { getAPP } from 'payment/src/utils/request';
import { APPDetailType } from 'payment/src/utils/types';
import Address from 'payment/src/components/Address';
import Networks from 'common/conf/Networks';
import { APPDetailRow } from 'payment/src/components/APPDetail';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Button, Input, Modal, Form, InputNumber, Space } from 'antd';
import { showToast } from 'common/components/showPopup/Toast';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { validateHexAddress } from 'common/utils/addressUtils';

interface AddressSettingsProps extends React.HTMLAttributes<HTMLDivElement> {
    address: string;
}

const AddressSettings = ({ address }: AddressSettingsProps) => {
    const [formAdmin] = Form.useForm();
    const [formRecipient] = Form.useForm();
    const [loadingAdmin, setLoadingAdmin] = useState(false);
    const [loadingRecipient, setLoadingRecipient] = useState(false);

    const onFinishAdmin = useCallback(() => {
        formAdmin.validateFields().then(async function ({ admin }) {
            try {
                setLoadingAdmin(true);
                console.log('admin addresses: ', admin);
                // const d = await configAPPCard(address, {
                //     props: admin.reduce(
                //         // @ts-ignore
                //         (prev, curr) => {
                //             prev[0].push(curr.value);
                //             prev[1].push(curr.description);
                //             return prev;
                //         },
                //         [[], []]
                //     ),
                // });
                showToast(`Update APP admin address success`, { type: 'success' });
            } catch (e) {
                console.log(e);
            }
            setLoadingAdmin(false);
        });
    }, []);

    const onFinishRecipient = useCallback(() => {
        formRecipient.validateFields().then(async function ({ recipient }) {
            try {
                setLoadingRecipient(true);
                console.log('recipient addresses: ', recipient);
                // const d = await configAPPCard(address, {
                //     props: admin.reduce(
                //         // @ts-ignore
                //         (prev, curr) => {
                //             prev[0].push(curr.value);
                //             prev[1].push(curr.description);
                //             return prev;
                //         },
                //         [[], []]
                //     ),
                // });
                showToast(`Update APP admin address success`, { type: 'success' });
            } catch (e) {
                console.log(e);
            }
            setLoadingRecipient(false);
        });
    }, []);

    return (
        <>
            <div className="text-xl mb-2">Settings</div>
            <div>
                <div className="text-gray-400">APP Admin</div>
                <div className="text-gray-700 text-xs mb-2">
                    Allows you to set a wallet address as an admin on your contract, which means it can perform actions on your APP such as setting, manage
                    APIs, drop to users.
                </div>
                <Form form={formAdmin} name="APPAdmin" autoComplete="off" layout="vertical" onFinish={onFinishAdmin}>
                    <Form.List
                        name="admin"
                        initialValue={[
                            {
                                address: '',
                            },
                        ]}
                    >
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }, i) => (
                                    <>
                                        <Space key={key + i} style={{ display: 'flex', marginBottom: 0 }} align="baseline">
                                            <Form.Item
                                                className="!mb-2"
                                                {...restField}
                                                name={[name, 'address']}
                                                validateFirst={true}
                                                rules={[
                                                    { required: true, message: 'Please input address' },
                                                    {
                                                        validator: async (_, address) => {
                                                            if (!validateHexAddress(address)) {
                                                                return Promise.reject(new Error('Invalid address'));
                                                            }
                                                            return Promise.resolve();
                                                        },
                                                    },
                                                ]}
                                            >
                                                <Input
                                                    style={{
                                                        width: '380px',
                                                    }}
                                                    placeholder="Address"
                                                />
                                            </Form.Item>
                                            {fields.length > 1 && <MinusCircleOutlined onClick={() => remove(name)} />}
                                            {i === fields.length - 1 && <PlusCircleOutlined onClick={() => add(name)} />}
                                        </Space>
                                    </>
                                ))}
                            </>
                        )}
                    </Form.List>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loadingAdmin}>
                            Save
                        </Button>
                    </Form.Item>
                </Form>
            </div>
            <div>
                <div className="text-gray-400">Earning Recipient</div>
                <div className="text-gray-700 text-xs mb-2">
                    Allows you to set a wallet address as earnings recipient on your contract, which means it can withdraw earnings or be recipient only.
                </div>
                <Form form={formRecipient} name="APPRecipient" autoComplete="off" layout="vertical" onFinish={onFinishRecipient}>
                    <Form.Item
                        label=""
                        name="recipient"
                        rules={[
                            { required: true, message: 'Please input address' },
                            {
                                validator: async (_, address) => {
                                    if (!validateHexAddress(address)) {
                                        return Promise.reject(new Error('Invalid address'));
                                    }
                                    return Promise.resolve();
                                },
                            },
                        ]}
                        validateFirst={true}
                        style={{
                            marginBottom: '8px',
                        }}
                    >
                        <Input
                            style={{
                                width: '380px',
                            }}
                            placeholder="Address"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loadingRecipient}>
                            Save
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </>
    );
};

export default ({ address }: AddressSettingsProps) => {
    const [data, setData] = useState<APPDetailType>({
        name: '',
        link: '',
        address: '',
        symbol: '',
        description: '',
    });
    const [_, setLoading] = useState<boolean>(false);

    const main = useCallback(
        async function main() {
            try {
                if (address) {
                    setLoading(true);
                    const data = await getAPP(address);
                    console.log(333, data);
                    setData(data);
                }
            } catch (error) {
                console.log(error);
            }
            setLoading(false);
        },
        [address]
    );

    useEffect(() => {
        main();
    }, [address]);

    return (
        <>
            <APPDetailRow
                column={3}
                details={[
                    {
                        label: 'APP Name',
                        content: data.name || '-',
                    },
                    {
                        label: 'Symbol',
                        content: data.symbol || '-',
                    },
                    {
                        label: 'Link',
                        content: data.link || '-',
                    },
                    {
                        label: 'Description',
                        content: data.description || '-',
                    },
                    {
                        label: 'APP Address',
                        content: address ? <Address link={`${Networks.eSpace.blockExplorerUrls[0]}/address/${address}`}>{address as string}</Address> : '-',
                    },
                ]}
            />
            <AddressSettings address={address as string} />
        </>
    );
};
