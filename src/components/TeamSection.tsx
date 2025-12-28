import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function TeamSection() {
    const tTeam = useTranslations('Team');
    const tMembers = useTranslations('Members');

    const poles = [
        { key: 'pole_training', leadKey: 'pole_training_lead', missionKey: 'pole_training_mission', color: 'text-blue-300', iconColor: 'text-blue-400', isDual: false, images: ['/assets/oscar.jpg'] },
        { key: 'pole_tech', leadKey: 'pole_tech_leads', missionKey: 'pole_tech_mission', color: 'text-emerald-300', iconColor: 'text-emerald-400', isDual: true, images: ['/assets/patrice.jpg', '/assets/rayann.jpg'] },
        { key: 'pole_research', leadKey: 'pole_research_leads', missionKey: 'pole_research_mission', color: 'text-purple-300', iconColor: 'text-purple-400', isDual: true, images: ['/assets/ange.jpg', '/assets/nerry.jpg'] },
        { key: 'pole_international', leadKey: 'pole_international_lead', missionKey: 'pole_international_mission', color: 'text-orange-300', iconColor: 'text-orange-400', isDual: false, images: ['/assets/yannick.jpg'] },
        { key: 'pole_events', leadKey: 'pole_events_lead', missionKey: 'pole_events_mission', color: 'text-pink-300', iconColor: 'text-pink-400', isDual: false, images: ['/assets/philipe.jpg'] },
        { key: 'pole_com', leadKey: 'pole_com_leads', missionKey: 'pole_com_mission', color: 'text-cyan-300', iconColor: 'text-cyan-400', isDual: true, images: [null, '/assets/Nathanael.jpg'] },
        { key: 'pole_admin', leadKey: 'pole_admin_leads', missionKey: 'pole_admin_mission', color: 'text-gray-300', iconColor: 'text-gray-400', isDual: true, images: ['/assets/caleb.jpg', null] },
    ];

    const mentors = [1, 2, 3, 4, 5];

    // Reusable Social Icon Component
    const SocialLink = ({ type, url }: { type: 'linkedin' | 'github', url: string }) => (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors p-1" aria-label={type}>
            {type === 'linkedin' ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
            )}
        </a>
    );

    return (
        <section id="team" className="py-20 px-4 min-h-screen flex flex-col justify-center relative">
            {/* Background Glow */}
            <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-900/20 rounded-full blur-[100px] -z-10"></div>
            <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-900/20 rounded-full blur-[100px] -z-10"></div>

            <div className="max-w-6xl mx-auto w-full text-center z-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-12 text-white text-glow drop-shadow-lg">{tTeam('title')}</h2>

                {/* Executive Board */}
                <div className="mb-16">
                    <h3 className="text-xl font-bold mb-8 text-white/90 border-b border-white/10 pb-3 inline-block">{tTeam('board_title')}</h3>
                    <div className="flex flex-col md:flex-row justify-center gap-6">
                        {/* President */}
                        <div className="p-6 rounded-[1.5rem] bg-gradient-to-br from-blue-900/30 to-slate-900/30 backdrop-blur-xl border border-white/10 hover:border-blue-500/50 shadow-2xl flex-1 max-w-sm mx-auto transform hover:scale-105 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-black border-2 border-blue-400/30 flex items-center justify-center overflow-hidden group-hover:border-blue-400/80 transition-colors shadow-[0_0_20px_rgba(59,130,246,0.2)] relative">
                                <Image src="/assets/fresnel.jpg" alt="Fresnel SATIGNON" fill className="object-cover" />
                            </div>
                            <div className="text-sm text-blue-300 font-bold mb-1 tracking-widest uppercase">{tTeam('president')}</div>
                            <div className="text-lg font-bold text-white mb-3">{tMembers('pres_name')}</div>
                            <div className="flex justify-center gap-4 border-t border-white/10 pt-4">
                                <SocialLink type="linkedin" url="#" />
                                <SocialLink type="github" url="#" />
                            </div>
                        </div>

                        {/* VP */}
                        <div className="p-6 rounded-[1.5rem] bg-gradient-to-br from-purple-900/30 to-slate-900/30 backdrop-blur-xl border border-white/10 hover:border-purple-500/50 shadow-2xl flex-1 max-w-sm mx-auto transform hover:scale-105 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-black border-2 border-purple-400/30 flex items-center justify-center overflow-hidden group-hover:border-purple-400/80 transition-colors shadow-[0_0_20px_rgba(168,85,247,0.2)] relative">
                                <Image src="/assets/meric.jpg" alt="Méric GBEMETONOU" fill className="object-cover" />
                            </div>
                            <div className="text-sm text-purple-300 font-bold mb-1 tracking-widest uppercase">{tTeam('vice_president')}</div>
                            <div className="text-lg font-bold text-white mb-3">{tMembers('vp_name')}</div>
                            <div className="flex justify-center gap-4 border-t border-white/10 pt-4">
                                <SocialLink type="linkedin" url="#" />
                                <SocialLink type="github" url="#" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Strategic Poles */}
                <div className="mb-16">
                    <h3 className="text-xl font-bold mb-8 text-white/90 border-b border-white/10 pb-3 inline-block">{tTeam('poles_title')}</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {poles.map((pole) => (
                            <div key={pole.key} className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 text-left flex items-start gap-4 group hover:-translate-y-1 hover:shadow-xl relative overflow-hidden">

                                {/* Avatar Container */}
                                <div className="flex shrink-0">
                                    {/* First Avatar */}
                                    <div className={`w-14 h-14 rounded-xl bg-[#020617] border border-white/10 flex items-center justify-center overflow-hidden z-20 shadow-lg ${pole.iconColor} ring-2 ring-[#020617] relative`}>
                                        {pole.images?.[0] ? (
                                            <Image src={pole.images[0]} alt="Lead" fill className="object-cover" />
                                        ) : (
                                            <svg className="w-7 h-7 opacity-60 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                        )}
                                    </div>

                                    {/* Second Avatar (conditionally rendered) */}
                                    {pole.isDual && (
                                        <div className={`w-14 h-14 rounded-xl bg-[#020617] border border-white/10 flex items-center justify-center overflow-hidden -ml-4 z-10 shadow-lg ${pole.iconColor} ring-2 ring-[#020617] relative`}>
                                            {pole.images?.[1] ? (
                                                <Image src={pole.images[1]} alt="Co-Lead" fill className="object-cover" />
                                            ) : (
                                                <svg className="w-7 h-7 opacity-60 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-bold mb-0.5 ${pole.color} group-hover:brightness-125 transition-all leading-tight shadow-black drop-shadow-md`}>{tTeam(pole.key)}</h4>
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5 font-bold">{pole.isDual ? 'Co-Leads' : tTeam('role_lead')}</div>
                                    <div className="text-white text-sm font-medium mb-1 truncate">{tMembers(pole.leadKey)}</div>
                                    <p className="text-[10px] text-gray-400 mb-3 leading-tight min-h-[2.5em]">{tTeam(pole.missionKey)}</p>
                                    <div className="flex gap-2">
                                        <SocialLink type="linkedin" url="#" />
                                        <SocialLink type="github" url="#" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mentors */}
                <div>
                    <h3 className="text-xl font-bold mb-8 text-white/90 border-b border-white/10 pb-3 inline-block">{tTeam('mentors_title')}</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        {mentors.map((i) => (
                            <div key={i} className="pl-2 pr-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 hover:border-white/30 transition-all cursor-default flex items-center gap-2 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-white/10 to-transparent flex items-center justify-center border border-white/10">
                                    <svg className="w-3 h-3 text-white/50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                </div>
                                <span className="text-xs font-medium text-white/80">{tMembers(`mentor_${i}`)}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}
