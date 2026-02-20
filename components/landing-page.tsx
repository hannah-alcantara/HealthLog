import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Sparkles, FileText } from "lucide-react";

export function LandingPage() {
  return (
    <div className='min-h-screen'>
      {/* Hero Section */}
      <section className='container mx-auto px-4 py-16 md:py-24'>
        <div className='grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto'>
          <div className='space-y-6'>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold leading-tight'>
              Turn Your Symptom Logs into Smarter Doctor Visits.
            </h1>
            <p className='text-lg text-muted-foreground'>
              HealthLog helps you track your health and uses AI to prepare you
              with the right questions for your next appointment.
            </p>
            <Link href='/sign-up'>
              <Button size='lg' className='text-base px-8'>
                Start Logging Your Symptoms
              </Button>
            </Link>
          </div>
          <div className='relative'>
            <div className='aspect-square rounded-2xl bg-gradient-to-br from-green-900 via-green-600 to-teal-400 shadow-2xl' />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id='how-it-works'
        className='container mx-auto px-4 py-16 md:py-24'
      >
        <div className='max-w-6xl mx-auto'>
          <h2 className='text-3xl md:text-4xl font-bold mb-4 text-center'>
            How It Works
          </h2>
          <p className='text-center text-muted-foreground mb-12'>
            A simple, three-step process to get you prepared for your next
            doctor&apos;s visit.
          </p>

          <div className='grid md:grid-cols-3 gap-8'>
            <Card className='border-2 hover:border-primary/20 transition-colors'>
              <CardContent className='pt-6'>
                <div className='w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4'>
                  <Activity className='w-6 h-6 text-primary' />
                </div>
                <h3 className='font-bold text-lg mb-2'>
                  1. Track Your Symptoms Easily
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Quickly log your symptoms and their severity day-by-day in our
                  secure journal.
                </p>
              </CardContent>
            </Card>

            <Card className='border-2 hover:border-primary/20 transition-colors'>
              <CardContent className='pt-6'>
                <div className='w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4'>
                  <Sparkles className='w-6 h-6 text-primary' />
                </div>
                <h3 className='font-bold text-lg mb-2'>
                  2. Our AI Identifies Key Patterns
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Our intelligent system analyzes your entries to find relevant
                  patterns and insights.
                </p>
              </CardContent>
            </Card>

            <Card className='border-2 hover:border-primary/20 transition-colors'>
              <CardContent className='pt-6'>
                <div className='w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4'>
                  <FileText className='w-6 h-6 text-primary' />
                </div>
                <h3 className='font-bold text-lg mb-2'>
                  3. Receive Personalized Questions
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Get a clear, concise list of questions to ask your doctor,
                  tailored to your logs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-card border-t py-12'>
        <div className='container mx-auto px-4'>
          <div className='max-w-6xl mx-auto'>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-8'>
              <div>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='text-xl font-bold'>HealthLog</span>
                </div>
                <p className='text-sm text-muted-foreground'>
                  Your data is private and secure. Always.
                </p>
                <p className='text-xs text-muted-foreground mt-2'>
                  © 2026 HealthLog. All rights reserved.
                </p>
              </div>

              <div className='flex flex-col sm:flex-row gap-6 sm:gap-8'>
                <Link
                  href='#privacy'
                  className='text-sm hover:text-primary transition-colors'
                >
                  Privacy Policy
                </Link>
                <Link
                  href='#terms'
                  className='text-sm hover:text-primary transition-colors'
                >
                  Terms of Service
                </Link>
                <Link
                  href='#contact'
                  className='text-sm hover:text-primary transition-colors'
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
