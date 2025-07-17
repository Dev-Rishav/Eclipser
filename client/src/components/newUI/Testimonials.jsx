

const Testimonials = () => {
  const testimonials = [
    {
      content: "Eclipser has transformed the way I learn and grow as a developer. The community is incredibly supportive, and the contests have sharpened my problem-solving skills.",
      author: "Sarah Johnson",
      role: "Senior Frontend Developer",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg"
    },
    {
      content: "I've found solutions to problems I've been stuck on for days within minutes of posting on Eclipser. The platform's space theme also makes coding feel like an adventure!",
      author: "Michael Torres",
      role: "Backend Engineer",
      avatar: "https://randomuser.me/api/portraits/men/43.jpg"
    }
  ];

  return (
    <section id="testimonials" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-eclipse-text-light dark:text-space-text">Developers Love Eclipser</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-stellar-blue via-stellar-orange to-stellar-green mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-eclipse-surface dark:bg-space-dark p-8 rounded-xl border border-eclipse-border dark:border-space-gray hover:border-stellar-blue/50 transition-all duration-300 hover:shadow-space-card"
            >
              <p className="text-eclipse-muted-light dark:text-space-muted italic mb-6 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.author} 
                  className="w-12 h-12 rounded-full mr-4 border-2 border-stellar-blue"
                />
                <div>
                  <h4 className="font-semibold text-eclipse-text-light dark:text-space-text">{testimonial.author}</h4>
                  <p className="text-eclipse-muted-light dark:text-space-muted text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-eclipse-muted-light dark:text-space-muted mb-8">Join thousands of developers who are already part of our community</p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="bg-eclipse-surface dark:bg-space-dark px-6 py-3 rounded-lg flex items-center border border-eclipse-border dark:border-space-gray shadow-space-card">
              <span className="text-3xl font-bold mr-2 text-stellar-blue">15K+</span>
              <span className="text-eclipse-muted-light dark:text-space-muted">Active Users</span>
            </div>
            <div className="bg-eclipse-surface dark:bg-space-dark px-6 py-3 rounded-lg flex items-center border border-eclipse-border dark:border-space-gray shadow-space-card">
              <span className="text-3xl font-bold mr-2 text-stellar-orange">250+</span>
              <span className="text-eclipse-muted-light dark:text-space-muted">Weekly Contests</span>
            </div>
            <div className="bg-eclipse-surface dark:bg-space-dark px-6 py-3 rounded-lg flex items-center border border-eclipse-border dark:border-space-gray shadow-space-card">
              <span className="text-3xl font-bold mr-2 text-stellar-green">5M+</span>
              <span className="text-eclipse-muted-light dark:text-space-muted">Questions Answered</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;