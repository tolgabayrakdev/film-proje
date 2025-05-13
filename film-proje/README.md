# Film Öneri Asistanı 

Bu proje, kullanıcıların ruh haline, tercihlerine ve izleme bağlamına göre film önerileri sunan modern bir web uygulamasıdır. TMDB API kullanarak güncel film verilerine erişir.

## Özellikler

- **Kişiselleştirilmiş Sorular**
  - Ruh hali analizi
  - Film türü tercihi
  - Film uzunluğu tercihi
  - İzleme arkadaşı (yalnız, aile, arkadaşlar, vb.)
  - Film dönemi tercihi

- **Film Önerileri**
  - Kullanıcı tercihlerine göre özelleştirilmiş film önerileri
  - Film posterleri ve temel bilgiler
  - Detaylı film sayfaları
  - TMDB puanları


Header ve logo olucak. Anasayfaya dönüş linki olucak.


## Kurulum

1. Projeyi klonlayın:
   ```bash
   git clone <repo-url>
   cd film-proje
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. TMDB API Anahtarı Alın:
   - [TMDB](https://www.themoviedb.org/) sitesine kaydolun
   - Hesap ayarlarından API anahtarı alın
   - Projenin kök dizininde `.env.local` dosyası oluşturun:
     ```
     NEXT_PUBLIC_TMDB_API_KEY=sizin_api_anahtarınız
     ```

4. Uygulamayı çalıştırın:
   ```bash
   npm run dev
   ```

5. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

## Teknolojiler

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- TMDB API

## Lisans

MIT
