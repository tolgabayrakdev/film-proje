"use client";
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../components/Header';

// Types
interface Movie {
  id: number;
  title: string;
  release_date: string;
  overview: string;
  vote_average: number;
  poster_path: string;
  runtime?: number;
  genres?: {id: number; name: string}[];
}

interface Question {
  id: string;
  text: string;
  options: {
    value: string;
    label: string;
  }[];
}

// TMDB API configuration
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700">
      <Header />
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
              <span className="block">Film Öneri</span>
              <span className="block text-indigo-200">Asistanı</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-indigo-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Ruh halinize ve tercihlerinize göre kişiselleştirilmiş film önerileri alın. Artık "Ne izlesem?" sorusuna son!
            </p>
            <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
              <div className="rounded-md shadow">
                <Link href="/quiz" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10">
                  Hemen Başla
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Özellikler</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Kişiselleştirilmiş Film Deneyimi
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Ruh halinize ve tercihlerinize göre özel film önerileri alın, yeni filmler keşfedin.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Kişiselleştirilmiş Öneriler</h3>
                    <p className="mt-5 text-base text-gray-500">Ruh halinize, tercihlerinize ve izleme bağlamınıza göre özel film önerileri alın.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Güncel Film Veritabanı</h3>
                    <p className="mt-5 text-base text-gray-500">TMDB API ile güncel film verilerine erişim sağlayarak her zaman yeni öneriler sunar.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Detaylı Film Bilgileri</h3>
                    <p className="mt-5 text-base text-gray-500">Film posterleri, puanları, süreleri ve konuları hakkında detaylı bilgiler edinin.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="bg-indigo-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Nasıl Çalışır?</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Dört Basit Adımda Film Önerileri
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                  <span className="text-lg font-bold">1</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Ruh Halinizi Seçin</h3>
                <p className="mt-2 text-base text-gray-500">Şu anki ruh halinizi belirterek size uygun film önerileri alın.</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                  <span className="text-lg font-bold">2</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Film Tercihlerinizi Belirtin</h3>
                <p className="mt-2 text-base text-gray-500">Film türü, uzunluğu ve dönem tercihlerinizi seçin.</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                  <span className="text-lg font-bold">3</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">İzleme Bağlamınızı Paylaşın</h3>
                <p className="mt-2 text-base text-gray-500">Filmi kiminle izleyeceğinizi belirterek daha doğru öneriler alın.</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4">
                  <span className="text-lg font-bold">4</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Kişiselleştirilmiş Öneriler Alın</h3>
                <p className="mt-2 text-base text-gray-500">Tüm tercihlerinize göre özelleştirilmiş film önerilerini görüntüleyin.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Hemen Film Önerileri Almaya Başlayın</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-100">
            Ruh halinize ve tercihlerinize göre özel film önerileri için hemen testi başlatın.
          </p>
          <Link href="/quiz" className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto">
            Teste Başla
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} Tolga BAYRAK. Film verileri TMDB API kullanılarak sağlanmaktadır.
          </p>
        </div>
      </footer>
    </div>
  );
}
