interface Props extends React.HTMLAttributes<HTMLDivElement> {
    tips: React.ReactNode[];
}

export default ({ tips }: Props) => {
    if (tips.length) {
        return (
            <ul id="ul_tips" className="mt-4 mb-0 p-4 bg-red-100 text-gray-600 rounded-sm">
                {tips.map((t, i) => (
                    <li key={i}>{t}</li>
                ))}
            </ul>
        );
    } else {
        return null;
    }
};
