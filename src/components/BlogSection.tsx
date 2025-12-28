import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

export default function BlogSection() {
    const tHeader = useTranslations('Header');
    const tBlog = useTranslations('Blog_Posts');

    const posts = Array.from({ length: 6 }, (_, i) => i);
    const imageUrls = [
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1617791160505-6f00504e3519?q=80&w=2000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?q=80&w=2000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1504384308090-c54be3852f33?q=80&w=2000&auto=format&fit=crop"
    ];

    const categories = ["Visual Computing", "Analytics", "Machine Learning", "Neural Networks", "Deep Learning", "Robotics"];
    const dates = ["Oct 24, 2024", "Nov 02, 2024", "Nov 15, 2024", "Dec 01, 2024", "Dec 10, 2024", "Dec 20, 2024"];

    return (
        <section id="blog" className="py-24 px-4 min-h-screen relative">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/20 to-transparent -z-10"></div>
            <div className="absolute top-40 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>

            <div className="max-w-7xl mx-auto w-full">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white text-glow tracking-tight">{tHeader('blog')}</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-sm font-light">
                        Explore the latest insights, tutorials, and news from the EPI'AI community.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((i) => (
                        <article key={i} className="group relative flex flex-col h-full rounded-[2rem] bg-white/5 border border-white/10 hover:border-blue-400/30 transition-all duration-300 overflow-hidden hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]">
                            {/* Main Link Overlay */}
                            <Link href={`/blog/${i}`} className="absolute inset-0 z-0" aria-label={tBlog(`post_${i}_title`)} />

                            {/* Image Container */}
                            <div className="h-56 relative overflow-hidden">
                                <Image
                                    src={imageUrls[i]}
                                    alt={tBlog(`post_${i}_title`)}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>

                                {/* Category Tag */}
                                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-[10px] uppercase font-bold text-white tracking-wider">
                                    {categories[i]}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-4 font-medium uppercase tracking-wide">
                                    <span>{dates[i]}</span>
                                    <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                                    <span>5 min read</span>
                                </div>

                                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-300 transition-colors leading-tight">
                                    {tBlog(`post_${i}_title`)}
                                </h3>

                                <p className="text-gray-400 leading-relaxed font-light text-sm mb-6 flex-1 line-clamp-3">
                                    {tBlog(`post_${i}_desc`)}
                                </p>

                                {/* Footer / Social Shares */}
                                <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/5">
                                    <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                                        Share
                                    </div>

                                    <div className="flex gap-2 relative z-10">
                                        {/* LinkedIn */}
                                        <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-700 transition-colors" title="Share on LinkedIn">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                        </a>
                                        {/* Instagram */}
                                        <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-pink-600 transition-colors" title="Share on Instagram">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.407-.06 3.808-.06h.63zm1.673 5.378c-.856.441-1.844.665-2.905.665-3.328 0-6.026-2.698-6.026-6.026 0-1.061.224-2.049.665-2.905l1.693 7.218 6.573-6.573-7.218-1.693c.856-.441 1.844-.665 2.905-.665 3.328 0 6.026 2.698 6.026 6.026 0 1.061-.224 2.049-.665 2.905zM12 7.297a4.703 4.703 0 100 9.406 4.703 4.703 0 000-9.406zm5.776-3.297a1.404 1.404 0 100 2.808 1.404 1.404 0 000-2.808z" clipRule="evenodd" /></svg>
                                        </a>
                                        {/* Discord */}
                                        <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-indigo-600 transition-colors" title="Discuss on Discord">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" clipRule="evenodd" /></svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
