import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      number: '1',
      title: 'Create an Account',
      description: 'Sign up with your email or connect with GitHub to join our space-themed developer community.',
      color: 'stellar-blue'
    },
    {
      number: '2',
      title: 'Build Your Profile',
      description: 'Customize your profile with skills, experience, and connect with like-minded developers.',
      color: 'stellar-orange'
    },
    {
      number: '3',
      title: 'Engage & Learn',
      description: 'Ask questions, provide solutions, and participate in discussions to enhance your knowledge.',
      color: 'stellar-green'
    },
    {
      number: '4',
      title: 'Compete & Grow',
      description: 'Join weekly coding contests, solve algorithmic challenges, and showcase your problem-solving skills.',
      color: 'stellar-blue'
    }
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case 'stellar-blue':
        return 'bg-stellar-blue shadow-stellar-blue-glow';
      case 'stellar-orange':
        return 'bg-stellar-orange shadow-stellar-orange-glow';
      case 'stellar-green':
        return 'bg-stellar-green shadow-stellar-green-glow';
      default:
        return 'bg-stellar-blue shadow-stellar-blue-glow';
    }
  };

  return (
    <section id="how-it-works" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-eclipse-text-light dark:text-space-text">How Eclipser Works</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-stellar-blue via-stellar-orange to-stellar-green mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center relative">
              <div className={`w-16 h-16 flex items-center justify-center rounded-full text-white text-2xl font-bold mb-6 ${getColorClasses(step.color)}`}>
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-eclipse-text-light dark:text-space-text">{step.title}</h3>
              <p className="text-eclipse-muted-light dark:text-space-muted">{step.description}</p>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute right-0 top-8 transform translate-x-8">
                  <svg width="40" height="8" viewBox="0 0 40 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M39.3536 4.35355C39.5488 4.15829 39.5488 3.84171 39.3536 3.64645L36.1716 0.464466C35.9763 0.269204 35.6597 0.269204 35.4645 0.464466C35.2692 0.659728 35.2692 0.976311 35.4645 1.17157L38.2929 4L35.4645 6.82843C35.2692 7.02369 35.2692 7.34027 35.4645 7.53553C35.6597 7.7308 35.9763 7.7308 36.1716 7.53553L39.3536 4.35355ZM0 4.5H39V3.5H0V4.5Z" className="fill-stellar-orange"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;