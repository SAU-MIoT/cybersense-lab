-- Data for "public"."admin_users"
INSERT INTO "public"."admin_users" ("user_id", "display_name", "is_active", "created_at", "updated_at") VALUES ('7a4fe8f2-1b97-47a5-88ee-ceeaa567463d', 'Ismail Butun', true, '2026-05-17T15:36:48.393Z', '2026-05-17T15:36:48.393Z') ON CONFLICT DO NOTHING;

-- Data for "public"."announcements"
INSERT INTO "public"."announcements" ("id", "title", "content", "created_at", "is_published") VALUES ('69bec90c-ef38-40fa-9907-4cb666ec2e9d', 'SAÜ Milli Teknoloji Atölyesi''nde Bilim ve Teknoloji Haftası Programı', 'Sakarya Üniversitesi Milli Teknoloji Atölyesi''nde, 8-14 Mart Bilim ve Teknoloji Haftası kapsamında düzenlenen programda, teknoloji üretimi ve yapay zeka uygulamaları ele alındı.

8–14 Mart Bilim ve Teknoloji Haftası kapsamında Sakarya Üniversitesi Milli Teknoloji Atölyesi''nde düzenlenen programda, bilimsel üretim paketleri, üniversitelerin teknoloji geliştirmedeki rolü ve sanayide yapay zeka uygulamaları çeşitli oturumlarda seçildi. Programın sunumunda Rektör Yardımcıları Prof. Dr. Mehmet Barış Horzum, Prof. Dr. Halit Yaşar ve Prof. Konuşmalarda üniversitelerin teknolojik gelişmesindeki rol ile araştırma üniversitesi kapsamı çerçevesinde yürütülen çalışmalar değerlendirildi. Ayrıca üniversite–sanayi birleşiyor, uygulamalı eğitim ve gençlerin araştırma kültürünün gelişmesinin önemi vurgulanıyor.

Milli Teknoloji Atölyesi''nin sunduğu olanaklarla anlatıldı

Açılış bölümünde ayrıca Sakarya Üniversitesi bünyesinde kurulan Milli Teknoloji Atölyesinin üniversitenin araştırma ve teknoloji geliştirme vizyonu bölgesinin yeri seçildi. Atölyenin projelerinin gelişmesiyle aktifleşmesini destekleyen bir merkez olarak önemli bir rolün üstlendiği ifade edildi.

Program kapsamında Sakarya Üniversitesi Milli Teknoloji Atölyesi tanıtım sunumu gerçekleştirildi. Sunumda atölyenin kuruluş amacı, dağıtılan dağıtımlar ve dağıtım olanakları hakkında bilgi verildi. Tanıtımda atölyenin gençlerin proje geliştirme yeteneklerini artırmayı, teknoloji üretimine aktif katılımlarını sağlamayı ve disiplinler arası çalışmaları teşvik etmeyi hedeflediği belirtildi. Ayrıca atölyede yönetilen robotik, elektronik ve yazılımsal işbirliği ile uygulamalı eğitim paketlerine nasıl dahil edilebilecekleri hakkında bilgilendirme yapıldı.

Sanayide yeni trendler ve yapay zeka konuşuldu

Programın son bölümünde ise TÜBİTAK Bilim Söyleşisi adlı “Sanayide Yeni Trendler ve Yapay Zeka Uygulamaları” yer alıyor. Söyleşide yapay zekâ teknolojilerinin sanayi üretim geniş kullanım alanları ele alınırken, Endüstri 4.0 kapsamında veri analitiği, makine öğrenmesi ve otomasyon ölçümleri üretim değişimlerine katkıları değerlendirildi. Ayrıca otomasyon endüstriyelin önemli bileşenlerinden biri olan PLC sistemleri ve programlama boyutları hakkında bilgi verildi.

Söyleşide akıllı üretim sistemleri, kalite kontrol, bakım tahmin ve üretim çeşitliliği gibi alanlarda yapay zeka ve otomasyon teknolojilerinin sunduğu imkanlar da mevcutla paylaşıldı.', '2026-06-02T13:11:36.448Z', true) ON CONFLICT DO NOTHING;

-- Data for "public"."ekip"
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('f36a05b0-6402-42d0-b778-7da968720a77', 'İsmail Bütün', 'LİDER', 'Yazılım', 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-05-21T11:58:41.464Z', 4) ON CONFLICT DO NOTHING;
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('b5854c91-9da8-4860-8598-6529a39b619c', 'Serhat Har', 'Developer', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-05-21T11:59:23.391Z', 3) ON CONFLICT DO NOTHING;
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('e8251215-e599-4fb1-8651-45014d9d8fb8', 'Amro Baseet', 'Araştırmacı', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T08:12:05.545Z', 1) ON CONFLICT DO NOTHING;
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('fea17365-a556-4a8e-80f9-dd797b1a0f2b', 'Moataz Armash', 'Araştırmacı', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T08:16:58.492Z', 2) ON CONFLICT DO NOTHING;
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('f8b12e72-af04-4e98-a562-92b366a91509', 'Gökdeniz Demir', 'Araştırmacı', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T08:11:29.971Z', 2) ON CONFLICT DO NOTHING;
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('a23aeb13-95a8-4589-966b-2226ea0ef78e', 'Sevcan Bayraktar', 'Araştırmacı', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T08:14:58.512Z', 2) ON CONFLICT DO NOTHING;
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('b292ceb7-fc4b-48e6-989f-065dec9c96f3', 'Sarah Al Musawi', 'Araştırmacı', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T08:15:59.638Z', 2) ON CONFLICT DO NOTHING;
INSERT INTO "public"."ekip" ("id", "name", "role", "expertise", "avatar_icon", "email", "linkedin_url", "github_url", "scholar_url", "website_url", "sort_order", "is_published", "created_at", "priority") VALUES ('09a797ca-e1e1-47a1-9390-1972902d58d5', 'Doğukan Ardahan', 'Developer', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T08:12:29.855Z', 2) ON CONFLICT DO NOTHING;

-- Data for "public"."ortaklar"
INSERT INTO "public"."ortaklar" ("id", "name", "icon", "url", "sort_order", "is_published", "created_at") VALUES ('523698d4-9a1f-4875-bbe0-6dc56829b779', 'TÜBİTAK', 'fa-atom', 'https://tubitak.gov.tr/', 1, true, '2026-05-16T18:00:27.359Z') ON CONFLICT DO NOTHING;
INSERT INTO "public"."ortaklar" ("id", "name", "icon", "url", "sort_order", "is_published", "created_at") VALUES ('8422d23b-dec0-46c1-b95f-496a3dd7d01b', 'SARGEM', 'fa-graduation-cap', '#', 6, true, '2026-05-16T18:00:27.359Z') ON CONFLICT DO NOTHING;

-- Data for "public"."projects"
INSERT INTO "public"."projects" ("id", "title", "description", "image_url", "github_url", "demo_url", "created_at", "is_published", "status", "funder", "date_range", "progress_pct") VALUES ('257d0641-2ae0-4ad8-9188-4ef380afb2b9', 'IoTNefes', 'Esentepe Kampüsü''nde hava kalitesini izleyen IoT (Nesnelerin İnterneti) tabanlı bir erken uyarı sistemidir. Projenin öne çıkan detayları şunlardır:Amaç: Kampüs içindeki hava kalitesini anlık olarak ölçmek, sürdürülebilirliğe katkı sağlamak ve riskli durumlarda yetkilileri uyarmak.Ölçülen Parametreler: Sıcaklık, nem, karbondioksit (CO₂) ve partikül madde değerleri.Çalışma Prensibi: Çeşitli noktalara yerleştirilen sensörler, verileri kablosuz altyapı ile merkezi bir ağa aktarır.', NULL, NULL, NULL, '2026-06-25T13:36:04.981Z', true, 'done', 'tübitak', '15/03/2025 - 15/08/2025', 100) ON CONFLICT DO NOTHING;

-- Data for "public"."site_ayarlari"
INSERT INTO "public"."site_ayarlari" ("key", "value", "updated_at") VALUES ('lab_adres', 'Sakarya Üniversitesi, Bilgisayar ve Bilişim Bilimleri Fakültesi, Esentepe Kampüsü, 54187 Serdivan / Sakarya', '2026-05-16T18:00:27.254Z') ON CONFLICT DO NOTHING;
INSERT INTO "public"."site_ayarlari" ("key", "value", "updated_at") VALUES ('lab_telefon', '+90 (264) 295 XXXX', '2026-05-16T18:00:27.254Z') ON CONFLICT DO NOTHING;
INSERT INTO "public"."site_ayarlari" ("key", "value", "updated_at") VALUES ('lab_calisma_saatleri', 'Pazartesi – Cuma: 09:00 – 17:00', '2026-05-16T18:00:27.254Z') ON CONFLICT DO NOTHING;
INSERT INTO "public"."site_ayarlari" ("key", "value", "updated_at") VALUES ('kurulis_yili', '2025', '2026-05-16T18:00:27.254Z') ON CONFLICT DO NOTHING;
INSERT INTO "public"."site_ayarlari" ("key", "value", "updated_at") VALUES ('lab_email', 'ibutun@sakarya.edu.tr', '2026-05-17T15:52:26.825Z') ON CONFLICT DO NOTHING;
INSERT INTO "public"."site_ayarlari" ("key", "value", "updated_at") VALUES ('is_ortagi_sayisi', '2', '2026-05-17T16:15:34.055Z') ON CONFLICT DO NOTHING;

