-- Published content copied from the legacy zyujjhhceasuwjmfatzy project.
-- Run after 20260827_01. This migration is non-destructive: source rows are
-- upserted by stable id/key and unrelated rows in the target are left intact.

BEGIN;

INSERT INTO public.announcements
  (id, title, content, created_at, is_published, publish_date)
VALUES
  (
    '69bec90c-ef38-40fa-9907-4cb666ec2e9d',
    'SAÜ Milli Teknoloji Atölyesi''nde Bilim ve Teknoloji Haftası Programı',
    $content$Sakarya Üniversitesi Milli Teknoloji Atölyesi'nde, 8-14 Mart Bilim ve Teknoloji Haftası kapsamında düzenlenen programda, teknoloji üretimi ve yapay zeka uygulamaları ele alındı.

8–14 Mart Bilim ve Teknoloji Haftası kapsamında Sakarya Üniversitesi Milli Teknoloji Atölyesi'nde düzenlenen programda, bilimsel üretim paketleri, üniversitelerin teknoloji geliştirmedeki rolü ve sanayide yapay zeka uygulamaları çeşitli oturumlarda seçildi. Programın sunumunda Rektör Yardımcıları Prof. Dr. Mehmet Barış Horzum, Prof. Dr. Halit Yaşar ve Prof. Konuşmalarda üniversitelerin teknolojik gelişmesindeki rol ile araştırma üniversitesi kapsamı çerçevesinde yürütülen çalışmalar değerlendirildi. Ayrıca üniversite–sanayi birleşiyor, uygulamalı eğitim ve gençlerin araştırma kültürünün gelişmesinin önemi vurgulanıyor.

Milli Teknoloji Atölyesi'nin sunduğu olanaklarla anlatıldı

Açılış bölümünde ayrıca Sakarya Üniversitesi bünyesinde kurulan Milli Teknoloji Atölyesinin üniversitenin araştırma ve teknoloji geliştirme vizyonu bölgesinin yeri seçildi. Atölyenin projelerinin gelişmesiyle aktifleşmesini destekleyen bir merkez olarak önemli bir rolün üstlendiği ifade edildi.

Program kapsamında Sakarya Üniversitesi Milli Teknoloji Atölyesi tanıtım sunumu gerçekleştirildi. Sunumda atölyenin kuruluş amacı, dağıtılan dağıtımlar ve dağıtım olanakları hakkında bilgi verildi. Tanıtımda atölyenin gençlerin proje geliştirme yeteneklerini artırmayı, teknoloji üretimine aktif katılımlarını sağlamayı ve disiplinler arası çalışmaları teşvik etmeyi hedeflediği belirtildi. Ayrıca atölyede yönetilen robotik, elektronik ve yazılımsal işbirliği ile uygulamalı eğitim paketlerine nasıl dahil edilebilecekleri hakkında bilgilendirme yapıldı.

Sanayide yeni trendler ve yapay zeka konuşuldu

Programın son bölümünde ise TÜBİTAK Bilim Söyleşisi adlı “Sanayide Yeni Trendler ve Yapay Zeka Uygulamaları” yer alıyor. Söyleşide yapay zekâ teknolojilerinin sanayi üretim geniş kullanım alanları ele alınırken, Endüstri 4.0 kapsamında veri analitiği, makine öğrenmesi ve otomasyon ölçümleri üretim değişimlerine katkıları değerlendirildi. Ayrıca otomasyon endüstriyelin önemli bileşenlerinden biri olan PLC sistemleri ve programlama boyutları hakkında bilgi verildi.

Söyleşide akıllı üretim sistemleri, kalite kontrol, bakım tahmin ve üretim çeşitliliği gibi alanlarda yapay zeka ve otomasyon teknolojilerinin sunduğu imkanlar da mevcutla paylaşıldı.$content$,
    '2026-06-02T16:11:36.448+03:00', true, '2026-03-10T16:11:00+03:00'
  ),
  (
    '6e2777af-158f-476d-8b31-47c867adf8ee',
    'IoT tabanlı hava kalitesi izleme ve uyarı sistemleri kapanış semineri',
    $content$SAÜ Milli Teknoloji Atolyesi'nde IoT tabanlı hava kalitesi izleme ve uyarı sistemi projemizin kapanış semineri, Avrupa birliği ve Proje Yönetimi Topluluğu, Proje yöneticisi Doç.Dr İsmail Bütün ve konuşmacı olarak Doç.Dr Aliye Suna Erses Yay'ın katkılarıyla herkese açık olarak gerçekleşti.$content$,
    '2026-07-09T14:04:23.304694+03:00', true, '2026-06-19T14:04:00+03:00'
  ),
  (
    'a8c3e0df-3a3d-46cc-82bc-101e8274ed35',
    'STARTEX Fuarı''nda CyberSense Laboratuvarı Projelerini Sergiledi',
    $content$Sakarya Teknokent tarafından düzenlenen STARTEX Girişimcilik ve İnovasyon Fuarı'nda, Sakarya Üniversitesi bünyesinde faaliyet gösteren CyberSense Laboratory de yerini aldı CyberSense Laboratory - Sakarya Üniversitesi Startex Girişimcilik ve İnovasyon Fuarı. Siber güvenlik, Nesnelerin İnterneti (IoT) ve makine öğrenmesi alanlarında Ar-Ge çalışmaları yürüten laboratuvar, geliştirdiği projeleri ziyaretçilere tanıttı.$content$,
    '2026-07-10T10:11:02.85003+03:00', true, '2026-05-07T10:11:00+03:00'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, content = EXCLUDED.content,
  created_at = EXCLUDED.created_at, is_published = EXCLUDED.is_published,
  publish_date = EXCLUDED.publish_date;

INSERT INTO public.arastirma_alanlari
  (id, icon, title, description, sort_order, is_published, created_at)
VALUES
  ('5c8162e0-4d45-4096-b669-156674771a5e', 'fa-shield', 'Differential Learning', 'Kritik kullanıcı verileri veya tıbbi kayıtlar yapay zeka modellerine öğretilirken, kaynak bilgilerin geriye dönük ifşa edilmesini matematiksel yöntemlerle önleyen ve veri akışındaki çok küçük sapmaları analiz ederek sinsi siber saldırıları erkenden tespit eden ileri düzey makine öğrenmesi çalışmaları yürütülmektedir.', 0, true, '2026-07-10T10:12:44.538879+03:00'),
  ('4b686af4-7d0c-4a93-b2d1-288d8a22a39a', 'fa-shield', 'Kapalı Alan Konumlama (Indoor Navigation)', 'GPS sinyallerinin ulaşamadığı binaların içinde yön bulma ve güvenli konum doğrulama teknolojileri üretir.', 0, true, '2026-07-10T10:13:01.647448+03:00'),
  ('afb621be-8064-42df-aff3-3a46d6061485', 'fa-shield', 'Yapay Zeka ve Anomali Tespiti', 'Geleneksel imza tabanlı güvenlik yazılımlarının kaçırdığı sıfırıncı gün (zero-day) saldırılarını yapay zeka ile engellemeyi amaçlar.', 0, true, '2026-07-10T10:13:17.973255+03:00'),
  ('ab1bfdbf-f679-4bdd-83c3-da678e475a32', 'fa-shield', 'Siber Güvenlik ve Ağ Güvenliği', 'Ağ sistemleri üzerinden akan verilerin gizliliğini ve bütünlüğünü korumayı hedefler.', 0, true, '2026-07-10T10:13:35.617852+03:00'),
  ('c05d3109-730a-4489-858b-0c617b064529', 'fa-shield', 'Sensör Teknolojileri ve Nesnelerin İnterneti (IoT)', 'Fiziksel dünyadan veri toplayan akıllı cihaz ağlarının güvenli ve verimli çalışması üzerine yoğunlaşır', 0, true, '2026-07-10T10:13:52.613786+03:00'),
  ('1eff62c0-a484-4776-9af5-90a9517d93a8', 'fa-shield', 'Tıbbi Nesnelerin İnterneti (Medical IoT / MIoT)', 'Sağlık sektöründe kullanılan giyilebilir ve uzaktan hasta izleme cihazlarının güvenliğini kapsar.', 0, true, '2026-07-10T10:14:08.86865+03:00')
ON CONFLICT (id) DO UPDATE SET
  icon = EXCLUDED.icon, title = EXCLUDED.title, description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order, is_published = EXCLUDED.is_published,
  created_at = EXCLUDED.created_at;

INSERT INTO public.ekip
  (id, name, role, expertise, avatar_icon, email, linkedin_url, github_url, scholar_url, website_url, sort_order, is_published, created_at, priority)
VALUES
  ('f36a05b0-6402-42d0-b778-7da968720a77', 'İsmail Bütün', 'LİDER', 'Yazılım', 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-05-21T14:58:41.464+03:00', 4),
  ('b5854c91-9da8-4860-8598-6529a39b619c', 'Serhat Har', 'Developer', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-05-21T14:59:23.391+03:00', 3),
  ('e8251215-e599-4fb1-8651-45014d9d8fb8', 'Amro Baseet', 'Araştırmacı', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T11:12:05.545+03:00', 1),
  ('fea17365-a556-4a8e-80f9-dd797b1a0f2b', 'Moataz Armash', 'Araştırmacı', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T11:16:58.492+03:00', 2),
  ('f8b12e72-af04-4e98-a562-92b366a91509', 'Gökdeniz Demir', 'Araştırmacı', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T11:11:29.971+03:00', 2),
  ('a23aeb13-95a8-4589-966b-2226ea0ef78e', 'Sevcan Bayraktar', 'Araştırmacı', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T11:14:58.512+03:00', 2),
  ('b292ceb7-fc4b-48e6-989f-065dec9c96f3', 'Sarah Al Musawi', 'Araştırmacı', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T11:15:59.638+03:00', 2),
  ('09a797ca-e1e1-47a1-9390-1972902d58d5', 'Doğukan Ardahan', 'Developer', NULL, 'fa-user', NULL, NULL, NULL, NULL, NULL, 0, true, '2026-06-29T11:12:29.855+03:00', 2)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, role = EXCLUDED.role, expertise = EXCLUDED.expertise,
  avatar_icon = EXCLUDED.avatar_icon, email = EXCLUDED.email,
  linkedin_url = EXCLUDED.linkedin_url, github_url = EXCLUDED.github_url,
  scholar_url = EXCLUDED.scholar_url, website_url = EXCLUDED.website_url,
  sort_order = EXCLUDED.sort_order, is_published = EXCLUDED.is_published,
  created_at = EXCLUDED.created_at, priority = EXCLUDED.priority;

INSERT INTO public.projects
  (id, title, description, image_url, github_url, demo_url, created_at, is_published, status, funder, date_range, progress_pct)
VALUES
  ('273bc4d9-168a-4e0f-b3d7-470edf8763eb', 'MIoT BİDEB', E'Projemiz; MIOT (Medical/Massive internet of Things) odaklı sistemler başta olmak üzere IoT\nve sensör teknolojileri, LoRaWAN tabanlı haberleşme altyapıları, ağ\ngüvenliği ve anomali tespiti konularında ozgün araştırma ve geliştirme faaliyetlerini\nkapsamaktadır. Çalışmalar, disiplinlerarası bir yaklaşımla hem teorik hem de uygulamalı\nAr-Ge çıktıları üretmeyi hedeflemektedir.', NULL, NULL, NULL, '2026-07-21T22:09:08.420228+03:00', true, 'active', 'Tübitak', NULL, 50),
  ('257d0641-2ae0-4ad8-9188-4ef380afb2b9', 'IoTNefes', 'Esentepe Kampüsü''nde hava kalitesini izleyen IoT (Nesnelerin İnterneti) tabanlı bir erken uyarı sistemidir. Projenin öne çıkan detayları şunlardır:Amaç: Kampüs içindeki hava kalitesini anlık olarak ölçmek, sürdürülebilirliğe katkı sağlamak ve riskli durumlarda yetkilileri uyarmak.Ölçülen Parametreler: Sıcaklık, nem, karbondioksit (CO₂) ve partikül madde değerleri.Çalışma Prensibi: Çeşitli noktalara yerleştirilen sensörler, verileri kablosuz altyapı ile merkezi bir ağa aktarır.', NULL, NULL, NULL, '2026-06-25T16:36:04.981+03:00', true, 'done', 'Tübitak', '15/03/2025 - 15/08/2025', 100)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  image_url = EXCLUDED.image_url, github_url = EXCLUDED.github_url,
  demo_url = EXCLUDED.demo_url, created_at = EXCLUDED.created_at,
  is_published = EXCLUDED.is_published, status = EXCLUDED.status,
  funder = EXCLUDED.funder, date_range = EXCLUDED.date_range,
  progress_pct = EXCLUDED.progress_pct;

INSERT INTO public.ortaklar
  (id, name, icon, url, sort_order, is_published, created_at)
VALUES
  ('523698d4-9a1f-4875-bbe0-6dc56829b779', 'TÜBİTAK', 'fa-atom', 'https://tubitak.gov.tr/', 1, true, '2026-05-16T21:00:27.359+03:00'),
  ('8422d23b-dec0-46c1-b95f-496a3dd7d01b', 'SARGEM', 'fa-graduation-cap', '#', 6, true, '2026-05-16T21:00:27.359+03:00')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, icon = EXCLUDED.icon, url = EXCLUDED.url,
  sort_order = EXCLUDED.sort_order, is_published = EXCLUDED.is_published,
  created_at = EXCLUDED.created_at;

INSERT INTO public.yayinlar
  (id, title, authors, venue, pub_type, pub_year, pdf_url, doi_url, is_published, created_at)
VALUES
  ('32207c7c-f891-49ca-982a-402e49e68183', 'A Security-Centric Warehouse Management Framework for Mitigating Product Abuse and Cybersecurity Risks', 'İsmail Bütün-Alparslan Sarı', 'Multidisciplinary Digital Publishing Institute) yayıncısının Computers adlı bilimsel dergisinde yayınlanmıştır.', 'journal', 2026, NULL, 'https://doi.org/10.3390/computers15060348', true, '2026-07-10T10:15:33.025439+03:00'),
  ('919d11a0-6f93-4008-89e3-83202507983f', 'Intrusion Detection and Intrusion Prevention Systems with Artifical Intelligence', 'İsmail Bütün-Engin Kay', '8th International Conference on Smart Applications, Communications and Networking', 'conference', 2026, NULL, NULL, true, '2026-07-22T10:45:12.270145+03:00'),
  ('6e1f28c5-2a9a-4232-9115-15361c12ee76', 'Single-GPU Evaluation of Graph-Based Models for Skeleton-Based Human Acting Recognition', 'İsmail Bütün-Khuloud Halimeh', '8th International Conference on Smart Applications, Communications and Networking', 'conference', 2026, NULL, NULL, true, '2026-07-22T10:52:00.423033+03:00'),
  ('b848508f-ae99-43b2-8def-26255ceaf00e', 'IoT-Based Real-Time Sensor Monitoring and Actuation: A Simulation-Driven Approach with LoRaWAN', 'İsmail Bütün-Burak Orçun Özkablan', '2025 International Conference on Smart Applications, Communications and Networking (SmartNets)', 'conference', 2025, NULL, 'https://doi.org/10.1109/SmartNets65254.2025.11106858', true, '2026-07-10T10:14:54.39056+03:00')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, authors = EXCLUDED.authors, venue = EXCLUDED.venue,
  pub_type = EXCLUDED.pub_type, pub_year = EXCLUDED.pub_year,
  pdf_url = EXCLUDED.pdf_url, doi_url = EXCLUDED.doi_url,
  is_published = EXCLUDED.is_published, created_at = EXCLUDED.created_at;

INSERT INTO public.site_ayarlari (key, value, updated_at)
VALUES
  ('lab_adres', 'Sakarya Üniversitesi, Bilgisayar ve Bilişim Bilimleri Fakültesi, Esentepe Kampüsü, 54187 Serdivan / Sakarya', '2026-05-16T21:00:27.254+03:00'),
  ('lab_telefon', '+90 (264) 295 XXXX', '2026-05-16T21:00:27.254+03:00'),
  ('lab_calisma_saatleri', 'Pazartesi – Cuma: 09:00 – 17:00', '2026-05-16T21:00:27.254+03:00'),
  ('kurulis_yili', '2025', '2026-05-16T21:00:27.254+03:00'),
  ('lab_email', 'ibutun@sakarya.edu.tr', '2026-05-17T18:52:26.825+03:00'),
  ('is_ortagi_sayisi', '2', '2026-05-17T19:15:34.055+03:00')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = EXCLUDED.updated_at;

-- Keep each legacy URL until its object upload succeeds. The companion script
-- updates one row only after the corresponding object is safely in the target.
INSERT INTO public.content_images
  (id, entity_type, entity_id, image_url, alt_text, sort_order, is_published, created_at)
VALUES
  ('4d9be8ea-32fe-4f35-92c0-bf2902981bf9', 'announcements', 'a8c3e0df-3a3d-46cc-82bc-101e8274ed35', 'https://zyujjhhceasuwjmfatzy.supabase.co/storage/v1/object/public/content-images/uploads/1783667960598-694123166_18076209587361912_7016211113919051469_n.webp', NULL, 0, true, '2026-07-13T17:49:27.364992+03:00'),
  ('71d0cd6a-f5d4-4187-a860-d621437d9af6', 'announcements', 'a8c3e0df-3a3d-46cc-82bc-101e8274ed35', 'https://zyujjhhceasuwjmfatzy.supabase.co/storage/v1/object/public/content-images/uploads/1783667961677-686116561_18076209569361912_960491612696297112_n.webp', NULL, 1, true, '2026-07-13T17:49:27.364992+03:00'),
  ('f4ea558d-5ec2-47d2-a594-118180635a90', 'announcements', 'a8c3e0df-3a3d-46cc-82bc-101e8274ed35', 'https://zyujjhhceasuwjmfatzy.supabase.co/storage/v1/object/public/content-images/uploads/1783667963218-688735185_18076209578361912_3437295823806258781_n.webp', NULL, 2, true, '2026-07-13T17:49:27.364992+03:00'),
  ('c7a825ed-c6af-4d0c-a304-af38c3dccd2e', 'announcements', 'a8c3e0df-3a3d-46cc-82bc-101e8274ed35', 'https://zyujjhhceasuwjmfatzy.supabase.co/storage/v1/object/public/content-images/uploads/1783667964524-686915174_18076209560361912_3393071235370437304_n.webp', NULL, 3, true, '2026-07-13T17:49:27.364992+03:00'),
  ('81f52b3d-6959-406d-b60a-631e81eace89', 'announcements', '6e2777af-158f-476d-8b31-47c867adf8ee', 'https://zyujjhhceasuwjmfatzy.supabase.co/storage/v1/object/public/content-images/uploads/1783668237085-726938014_17914897173404104_4638036528458398402_n.webp', NULL, 0, true, '2026-07-10T11:15:50.960297+03:00'),
  ('b3e7bd4c-c8e0-4da7-84b7-b94a4105faba', 'announcements', '6e2777af-158f-476d-8b31-47c867adf8ee', 'https://zyujjhhceasuwjmfatzy.supabase.co/storage/v1/object/public/content-images/uploads/1783668244213-726768010_17914897248404104_1299761521822649687_n.webp', NULL, 1, true, '2026-07-10T11:15:50.960297+03:00'),
  ('725b99ce-bd55-4e3f-b44d-8246ca77681d', 'announcements', '6e2777af-158f-476d-8b31-47c867adf8ee', 'https://zyujjhhceasuwjmfatzy.supabase.co/storage/v1/object/public/content-images/uploads/1783668248193-727490761_17914897227404104_6380251498585136666_n.webp', NULL, 2, true, '2026-07-10T11:15:50.960297+03:00'),
  ('704e3b65-6c01-416a-8a1b-2ea9ac52223c', 'announcements', '6e2777af-158f-476d-8b31-47c867adf8ee', 'https://zyujjhhceasuwjmfatzy.supabase.co/storage/v1/object/public/content-images/uploads/1783668251560-724706019_17914897236404104_6011308619998584252_n.webp', NULL, 3, true, '2026-07-10T11:15:50.960297+03:00'),
  ('2b47c583-3c40-4ec6-ad2a-4ffb67d84bab', 'announcements', '69bec90c-ef38-40fa-9907-4cb666ec2e9d', 'https://zyujjhhceasuwjmfatzy.supabase.co/storage/v1/object/public/content-images/uploads/1783668100756-712844770_18080183753361912_8876003116243925042_n.webp', NULL, 0, true, '2026-07-13T17:51:46.078593+03:00'),
  ('83042047-e87a-4477-a4ca-0d0b8f42442c', 'announcements', '69bec90c-ef38-40fa-9907-4cb666ec2e9d', 'https://zyujjhhceasuwjmfatzy.supabase.co/storage/v1/object/public/content-images/uploads/1783668110104-713325276_18080183789361912_1841083359293795683_n.webp', NULL, 1, true, '2026-07-13T17:51:46.078593+03:00'),
  ('ef7ce963-0d35-4503-b660-091169c34f8d', 'announcements', '69bec90c-ef38-40fa-9907-4cb666ec2e9d', 'https://zyujjhhceasuwjmfatzy.supabase.co/storage/v1/object/public/content-images/uploads/1783668111006-714871093_18080183780361912_2882488954679036831_n.webp', NULL, 2, true, '2026-07-13T17:51:46.078593+03:00'),
  ('26d2a3f6-e487-48af-b5ab-4c7d363152af', 'announcements', '69bec90c-ef38-40fa-9907-4cb666ec2e9d', 'https://zyujjhhceasuwjmfatzy.supabase.co/storage/v1/object/public/content-images/uploads/1783668112513-712287211_18080183771361912_4814526373363636020_n.webp', NULL, 3, true, '2026-07-13T17:51:46.078593+03:00'),
  ('6af21dc1-e3a9-4a66-8d74-ab8b0e20e1cf', 'announcements', '69bec90c-ef38-40fa-9907-4cb666ec2e9d', 'https://zyujjhhceasuwjmfatzy.supabase.co/storage/v1/object/public/content-images/uploads/1783668113402-715494676_18080183762361912_2664883297621621133_n.webp', NULL, 4, true, '2026-07-13T17:51:46.078593+03:00')
ON CONFLICT (id) DO UPDATE SET
  entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id,
  image_url = CASE
    WHEN public.content_images.image_url LIKE 'https://gaflirrelweuphsivmyp.supabase.co/storage/%'
      THEN public.content_images.image_url
    ELSE EXCLUDED.image_url
  END,
  alt_text = EXCLUDED.alt_text,
  sort_order = EXCLUDED.sort_order, is_published = EXCLUDED.is_published,
  created_at = EXCLUDED.created_at;

-- SQL Editor/service_role owns this operation. Application roles receive no
-- write permission on storage.buckets or storage.objects.
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-images', 'content-images', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, public = true;

DO $verify$
DECLARE
  actual integer;
BEGIN
  SELECT count(*) INTO actual FROM public.announcements
  WHERE id IN (
    '69bec90c-ef38-40fa-9907-4cb666ec2e9d',
    '6e2777af-158f-476d-8b31-47c867adf8ee',
    'a8c3e0df-3a3d-46cc-82bc-101e8274ed35'
  );
  IF actual <> 3 THEN RAISE EXCEPTION 'announcement backfill mismatch: expected 3, got %', actual; END IF;

  SELECT count(*) INTO actual FROM public.arastirma_alanlari
  WHERE id IN (
    '5c8162e0-4d45-4096-b669-156674771a5e', '4b686af4-7d0c-4a93-b2d1-288d8a22a39a',
    'afb621be-8064-42df-aff3-3a46d6061485', 'ab1bfdbf-f679-4bdd-83c3-da678e475a32',
    'c05d3109-730a-4489-858b-0c617b064529', '1eff62c0-a484-4776-9af5-90a9517d93a8'
  );
  IF actual <> 6 THEN RAISE EXCEPTION 'research-area backfill mismatch: expected 6, got %', actual; END IF;

  SELECT count(*) INTO actual FROM public.ekip
  WHERE id IN (
    'f36a05b0-6402-42d0-b778-7da968720a77', 'b5854c91-9da8-4860-8598-6529a39b619c',
    'e8251215-e599-4fb1-8651-45014d9d8fb8', 'fea17365-a556-4a8e-80f9-dd797b1a0f2b',
    'f8b12e72-af04-4e98-a562-92b366a91509', 'a23aeb13-95a8-4589-966b-2226ea0ef78e',
    'b292ceb7-fc4b-48e6-989f-065dec9c96f3', '09a797ca-e1e1-47a1-9390-1972902d58d5'
  );
  IF actual <> 8 THEN RAISE EXCEPTION 'team backfill mismatch: expected 8, got %', actual; END IF;

  SELECT count(*) INTO actual FROM public.projects
  WHERE id IN ('273bc4d9-168a-4e0f-b3d7-470edf8763eb', '257d0641-2ae0-4ad8-9188-4ef380afb2b9');
  IF actual <> 2 THEN RAISE EXCEPTION 'project backfill mismatch: expected 2, got %', actual; END IF;

  SELECT count(*) INTO actual FROM public.ortaklar
  WHERE id IN ('523698d4-9a1f-4875-bbe0-6dc56829b779', '8422d23b-dec0-46c1-b95f-496a3dd7d01b');
  IF actual <> 2 THEN RAISE EXCEPTION 'partner backfill mismatch: expected 2, got %', actual; END IF;

  SELECT count(*) INTO actual FROM public.yayinlar
  WHERE id IN (
    '32207c7c-f891-49ca-982a-402e49e68183', '919d11a0-6f93-4008-89e3-83202507983f',
    '6e1f28c5-2a9a-4232-9115-15361c12ee76', 'b848508f-ae99-43b2-8def-26255ceaf00e'
  );
  IF actual <> 4 THEN RAISE EXCEPTION 'publication backfill mismatch: expected 4, got %', actual; END IF;

  SELECT count(*) INTO actual FROM public.site_ayarlari
  WHERE key IN ('lab_adres', 'lab_telefon', 'lab_calisma_saatleri', 'kurulis_yili', 'lab_email', 'is_ortagi_sayisi');
  IF actual <> 6 THEN RAISE EXCEPTION 'setting backfill mismatch: expected 6, got %', actual; END IF;

  SELECT count(*) INTO actual FROM public.content_images
  WHERE id IN (
    '4d9be8ea-32fe-4f35-92c0-bf2902981bf9', '71d0cd6a-f5d4-4187-a860-d621437d9af6',
    'f4ea558d-5ec2-47d2-a594-118180635a90', 'c7a825ed-c6af-4d0c-a304-af38c3dccd2e',
    '81f52b3d-6959-406d-b60a-631e81eace89', 'b3e7bd4c-c8e0-4da7-84b7-b94a4105faba',
    '725b99ce-bd55-4e3f-b44d-8246ca77681d', '704e3b65-6c01-416a-8a1b-2ea9ac52223c',
    '2b47c583-3c40-4ec6-ad2a-4ffb67d84bab', '83042047-e87a-4477-a4ca-0d0b8f42442c',
    'ef7ce963-0d35-4503-b660-091169c34f8d', '26d2a3f6-e487-48af-b5ab-4c7d363152af',
    '6af21dc1-e3a9-4a66-8d74-ab8b0e20e1cf'
  );
  IF actual <> 13 THEN RAISE EXCEPTION 'image backfill mismatch: expected 13, got %', actual; END IF;

  IF EXISTS (
    SELECT 1
    FROM public.content_images ci
    WHERE ci.id IN (
      '4d9be8ea-32fe-4f35-92c0-bf2902981bf9', '71d0cd6a-f5d4-4187-a860-d621437d9af6',
      'f4ea558d-5ec2-47d2-a594-118180635a90', 'c7a825ed-c6af-4d0c-a304-af38c3dccd2e',
      '81f52b3d-6959-406d-b60a-631e81eace89', 'b3e7bd4c-c8e0-4da7-84b7-b94a4105faba',
      '725b99ce-bd55-4e3f-b44d-8246ca77681d', '704e3b65-6c01-416a-8a1b-2ea9ac52223c',
      '2b47c583-3c40-4ec6-ad2a-4ffb67d84bab', '83042047-e87a-4477-a4ca-0d0b8f42442c',
      'ef7ce963-0d35-4503-b660-091169c34f8d', '26d2a3f6-e487-48af-b5ab-4c7d363152af',
      '6af21dc1-e3a9-4a66-8d74-ab8b0e20e1cf'
    )
      AND ci.entity_type = 'announcements'
      AND NOT EXISTS (SELECT 1 FROM public.announcements a WHERE a.id = ci.entity_id)
  ) THEN
    RAISE EXCEPTION 'orphaned announcement image found in imported content_images rows';
  END IF;
END
$verify$;

COMMIT;
