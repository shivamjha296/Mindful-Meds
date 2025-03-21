import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BellRing, Calendar, Check, List, Pill, Plus, ChevronRight, Star, Clock, Users } from 'lucide-react';

const Index = () => {
  return (
    <>
      <Navbar />
      
      <main className="flex min-h-screen flex-col w-full">
        {/* Hero Section - Full Width */}
        <section className="w-full pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-blue-800">
                    Your Medication Assistant
                  </h1>
                  <p className="text-lg md:text-xl text-slate-700 max-w-[600px]">
                    Keep track of your medications easily and never miss a dose again.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
                  <Link to="/auth">
                    <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md text-lg px-8 py-6">
                      Start Now
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto border-blue-300 text-blue-700 hover:bg-blue-50 text-lg px-8 py-6">
                      See How It Works
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto flex w-full max-w-[500px] items-center justify-center">
                <img
                  src="https://cedarcoveassistedliving.com/wp-content/uploads/sites/2/2022/07/10-important-tips-for-better-medication-management.jpg"
                  alt="Senior using medication app"
                  className="rounded-xl object-cover object-center shadow-xl w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Benefits Section - Full Width */}
        <section className="w-full py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Why Choose MindfulMeds?</h2>
              <p className="text-slate-600 max-w-[700px] mx-auto">
                Our app is designed to be simple and helpful for managing your medications.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-blue-50 rounded-lg p-8 text-center shadow-sm">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-medium text-slate-900 mb-3">Never Miss a Dose</h3>
                <p className="text-slate-600 text-lg">
                  Get friendly reminders when it's time to take your medication.
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-8 text-center shadow-sm">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-medium text-slate-900 mb-3">Family Sharing</h3>
                <p className="text-slate-600 text-lg">
                  Let your family members help you keep track of your medications.
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-8 text-center shadow-sm">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Pill className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-medium text-slate-900 mb-3">Easy to Use</h3>
                <p className="text-slate-600 text-lg">
                  Simple screens and large buttons make it easy to use for everyone.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="w-full py-12 md:py-16 bg-slate-50">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">What You Can Do</h2>
              <p className="text-slate-600 max-w-[700px] mx-auto">
                Our app has everything you need to manage your medications.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Link to="/dashboard" className="group">
                <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-200 h-full transition-all duration-200 hover:shadow-md hover:border-blue-200">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-6">
                    <List className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-medium text-slate-900 mb-3 group-hover:text-blue-600">Dashboard</h3>
                  <p className="text-slate-600 text-lg">
                    See all your medications and upcoming doses in one place.
                  </p>
                </div>
              </Link>
              
              <Link to="/add-medication" className="group">
                <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-200 h-full transition-all duration-200 hover:shadow-md hover:border-blue-200">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-6">
                    <Plus className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-medium text-slate-900 mb-3 group-hover:text-blue-600">Add Medications</h3>
                  <p className="text-slate-600 text-lg">
                    Add your medications with easy-to-follow steps.
                  </p>
                </div>
              </Link>
              
              <Link to="/medication-tracker" className="group">
                <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-200 h-full transition-all duration-200 hover:shadow-md hover:border-blue-200">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-6">
                    <Check className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-medium text-slate-900 mb-3 group-hover:text-blue-600">Medication Tracker</h3>
                  <p className="text-slate-600 text-lg">
                    Keep a record of all the medications you've taken.
                  </p>
                </div>
              </Link>
              
              <Link to="/notifications" className="group">
                <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-200 h-full transition-all duration-200 hover:shadow-md hover:border-blue-200">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-6">
                    <BellRing className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-medium text-slate-900 mb-3 group-hover:text-blue-600">Reminders</h3>
                  <p className="text-slate-600 text-lg">
                    Get alerts when it's time to take your medication.
                  </p>
                </div>
              </Link>
              
              <div className="group">
                <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-200 h-full transition-all duration-200 hover:shadow-md hover:border-blue-200">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-6">
                    <Star className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-medium text-slate-900 mb-3 group-hover:text-blue-600">Medication Info</h3>
                  <p className="text-slate-600 text-lg">
                    Learn about your medications and possible side effects.
                  </p>
                </div>
              </div>
              
              <div className="group">
                <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-200 h-full transition-all duration-200 hover:shadow-md hover:border-blue-200">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-6">
                    <Calendar className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-medium text-slate-900 mb-3 group-hover:text-blue-600">Calendar View</h3>
                  <p className="text-slate-600 text-lg">
                    See your medication schedule on a calendar.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="w-full py-12 md:py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">What Our Users Say</h2>
              <p className="text-slate-600 max-w-[700px] mx-auto">
                People like you are using MindfulMeds to manage their medications.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-blue-50 rounded-lg p-8 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-700 mb-4 text-lg">
                  "This app has made it so much easier to keep track of my medications. The reminders are very helpful."
                </p>
                <div className="font-medium text-slate-900">- Mary, 58</div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-8 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-700 mb-4 text-lg">
                  "I can share my medication schedule with my daughter. It gives us both peace of mind."
                </p>
                <div className="font-medium text-slate-900">- Robert, 65</div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-8 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-700 mb-4 text-lg">
                  "The large buttons and clear text make it easy for me to use without my reading glasses."
                </p>
                <div className="font-medium text-slate-900">- Susan, 52</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Subtle CTA Section */}
        <section className="w-full py-12 md:py-16 bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-slate-900">Ready to Get Started?</h2>
              <p className="text-slate-700 max-w-[700px] mx-auto mb-8 text-lg">
                Join thousands of people who use MindfulMeds to manage their medications.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md text-lg px-8 py-6">
                    Sign Up Now
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-blue-300 text-blue-700 hover:bg-blue-50 text-lg px-8 py-6">
                    Try a Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
};

export default Index;
