type TableProps = {
    headers: string[];
    rows: React.ReactNode[][];
};

const Table: React.FC<TableProps> = ({ headers, rows }) => {
    return (
        <div className="w-full">
            <table className="w-full table-auto">
                <thead className="bg-[#F7F8FA]">
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index} className="px-4 py-2 text-[#A9ABB2] font-normal text-left">
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="px-4 py-2 text-[#3D3F4C]">
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