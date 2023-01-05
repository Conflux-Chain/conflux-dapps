interface Props extends React.HTMLAttributes<HTMLInputElement> {
    items: string[];
}

export default ({ items = [] }: Props) => {
    return (
        <ul id="ul_items" className="mt-4 mb-0 p-4 bg-red-100 text-gray-600 rounded-sm">
            {items.map((t, i) => (
                <li
                    key={i}
                    dangerouslySetInnerHTML={{
                        __html: t,
                    }}
                ></li>
            ))}
        </ul>
    );
};
