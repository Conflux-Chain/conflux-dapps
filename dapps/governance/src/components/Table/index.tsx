type TableProps = {
    headers: string[];
    rows: any;
};

const Table: React.FC<TableProps> = ({ headers, rows }) => {
    return (
        <div className="w-full">
            <table className="w-full table-auto">
                <thead className="bg-[#F7F8FA] h-[40px]">
                    <tr className="flex">
                        {headers.map((header, index) => (
                            <th key={index} className="flex-1 px-4 py-2 text-[#A9ABB2] font-normal flex items-center truncate">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white h-[48px]">
                    {rows.map((row: any, rowIndex: any) => (
                        <tr className="flex min-h-[48px]" key={rowIndex}>
                            {row.map((cell: any, cellIndex: any) => (
                                <td key={cellIndex} className="flex-1 px-4 py-2 text-[#3D3F4C] flex items-center truncate">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;