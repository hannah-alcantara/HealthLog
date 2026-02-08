"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Activity, Calendar, FileText, TrendingUp } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            HealthLog
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Track your health journey with ease
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Keep all your medical information in one secure place. Track symptoms, manage appointments, and maintain your health records.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <Card>
              <CardHeader>
                <Activity className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg mb-2">Track Symptoms</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Log and monitor your symptoms over time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Calendar className="w-12 h-12 mx-auto text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg mb-2">Appointments</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your doctor visits and medical appointments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="w-12 h-12 mx-auto text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg mb-2">Insights</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Visualize patterns and trends in your health data
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="w-12 h-12 mx-auto text-orange-600 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-lg mb-2">Records</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Store medical history and documents securely
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
