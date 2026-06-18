export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-purple-50 to-pink-50 py-16">

      {/* Floating Decorations */}
      <div className="absolute left-10 top-32 h-24 w-24 rounded-full bg-pink-200/50 blur-xl animate-pulse" />
      <div className="absolute right-20 top-52 h-20 w-20 rounded-full bg-yellow-200/50 blur-xl animate-bounce" />
      <div className="absolute bottom-20 left-20 h-28 w-28 rounded-full bg-blue-200/40 blur-xl animate-pulse" />
      <div className="absolute right-32 bottom-32 h-24 w-24 rounded-full bg-purple-200/40 blur-xl animate-bounce" />

      <div className="absolute left-[15%] top-[20%] text-5xl opacity-30">
        ⭐
      </div>

      <div className="absolute right-[18%] top-[25%] text-5xl opacity-30">
        🎮
      </div>

      <div className="absolute left-[20%] bottom-[20%] text-5xl opacity-30">
        🚀
      </div>

      

      <div className="mx-auto max-w-7xl px-6">

        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[40px] border border-white/60 bg-white/60 p-10 shadow-xl backdrop-blur-lg md:p-16">

          <div className="absolute left-10 top-10 h-24 w-24 rounded-full bg-yellow-200/40 blur-2xl" />
          <div className="absolute right-10 bottom-10 h-32 w-32 rounded-full bg-pink-200/40 blur-3xl" />

          <div className="relative z-10 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-bold text-blue-600 shadow-md">
              🌟 We Love Hearing From You!
            </span>

            <h1 className="mt-6 text-4xl font-extrabold text-slate-800 md:text-6xl">
              Contact The CodePlay Team
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-lg text-slate-600">
              Need help with your coding adventures? Have a question about a
              lesson? Our friendly team is ready to help young programmers
              continue their journey!
            </p>

            <div className="mt-8 flex justify-center">
              <div className="rounded-full bg-green-100 px-6 py-3 font-semibold text-green-700 shadow">
                🏆 Support Heroes Online
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="mt-16 grid gap-10 lg:grid-cols-2">

          {/* Form */}
          <div className="rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur">

            <h2 className="mb-2 text-3xl font-bold text-slate-800">
              🚀 Send Us a Message
            </h2>

            <p className="mb-8 text-slate-600">
              Fill out the form below and our team will get back to you.
            </p>

            <form className="space-y-6">

              <div>
                <label className="mb-2 block font-semibold text-slate-700">
                  Your Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full rounded-2xl border-2 border-sky-100 bg-sky-50 px-4 py-3 outline-none transition focus:border-blue-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold text-slate-700">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-2xl border-2 border-pink-100 bg-pink-50 px-4 py-3 outline-none transition focus:border-pink-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block font-semibold text-slate-700">
                  Message
                </label>

                <textarea
                  rows={6}
                  placeholder="Write your message..."
                  className="w-full rounded-2xl border-2 border-purple-100 bg-purple-50 px-4 py-3 outline-none transition focus:border-purple-400 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="group rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-8 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                Send Adventure Message 🚀
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">

            <div className="rounded-[32px] bg-gradient-to-br from-yellow-100 to-orange-100 p-8 shadow-lg">
              <div className="mb-4 text-5xl">📧</div>

              <h3 className="text-2xl font-bold text-slate-800">
                Email Us
              </h3>

              <p className="mt-3 text-slate-600">
                hello@codeplay.com
              </p>
            </div>

            <div className="rounded-[32px] bg-gradient-to-br from-blue-100 to-cyan-100 p-8 shadow-lg">
              <div className="mb-4 text-5xl">📞</div>

              <h3 className="text-2xl font-bold text-slate-800">
                Call Us
              </h3>

              <p className="mt-3 text-slate-600">
                +94 71 234 5678
              </p>
            </div>

            <div className="rounded-[32px] bg-gradient-to-br from-purple-100 to-pink-100 p-8 shadow-lg">
              <div className="mb-4 text-5xl">🌍</div>

              <h3 className="text-2xl font-bold text-slate-800">
                Community
              </h3>

              <p className="mt-3 text-slate-600">
                Join thousands of young coders learning and growing together.
              </p>
            </div>

            {/* Fun Stats Card */}
            <div className="rounded-[32px] bg-gradient-to-r from-green-100 via-teal-100 to-cyan-100 p-8 shadow-lg">

              <h3 className="mb-6 text-2xl font-bold text-slate-800">
                🎯 CodePlay Achievements
              </h3>

              <div className="grid grid-cols-3 gap-4 text-center">

                <div>
                  <div className="text-3xl font-extrabold text-blue-600">
                    5K+
                  </div>
                  <div className="text-sm text-slate-600">
                    Students
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-extrabold text-purple-600">
                    100+
                  </div>
                  <div className="text-sm text-slate-600">
                    Lessons
                  </div>
                </div>

                <div>
                  <div className="text-3xl font-extrabold text-pink-600">
                    50+
                  </div>
                  <div className="text-sm text-slate-600">
                    Challenges
                  </div>
                </div>

              </div>
            </div>

          </div>

        </section>

      </div>
    </main>
  );
}