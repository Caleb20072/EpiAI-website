export default function ExpertiseSection() {
    const pillars = [
        {
            title: "Mathématiques",
            svg: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-4 text-[#0066cc]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19l6-14 3.5 8.5L20 5" />
                    <path d="M4 12h16" />
                    <path d="M3 19h1a1 1 0 0 0 1-1V5" />
                </svg>
            )
        },
        {
            title: "Intelligence Artificielle",
            svg: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-4 text-[#0066cc]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                    <path d="M12 8v-2" />
                    <path d="M12 16v2" />
                    <path d="M16 12h2" />
                    <path d="M8 12H6" />
                    <path d="M9.5 9l-1.5-1.5" />
                    <path d="M14.5 9l1.5-1.5" />
                    <path d="M9.5 15l-1.5 1.5" />
                    <path d="M14.5 15l1.5 1.5" />
                </svg>
            )
        },
        {
            title: "Data Science",
            svg: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-4 text-[#0066cc]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 20V10" />
                    <path d="M12 20V4" />
                    <path d="M6 20v-6" />
                </svg>
            )
        }
    ];

    return (
        <section className="tile-dark py-20 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-[40px] font-semibold text-white">Nos domaines</h2>
                </div>

                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pillars.map((pillar, idx) => (
                        <div
                            key={idx}
                            className="p-8 rounded-[18px] border border-white/10 bg-[#2a2a2c] flex flex-col items-center text-center"
                        >
                            {pillar.svg}
                            <h3 className="text-[21px] font-semibold text-white">{pillar.title}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
