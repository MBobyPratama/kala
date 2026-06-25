# PRODUCT REQUIREMENTS DOCUMENT (PRD)

---

## 1. EXECUTIVE SUMMARY

### Project Name
*   **Kala** (Official Brand Identity: *Kala Preloved Hub*)

### Problem Statement
The preloved and thrift market in Indonesia is experiencing rapid growth, yet individual casual sellers face significant operational friction. When selling secondhand personal items, sellers must manage overlapping listings across multiple native e-commerce marketplaces (such as Shopee and Tokopedia) while simultaneously trying to advertise them through social media channels (Instagram, TikTok, X). 

Direct consumer communication via social media Direct Messages (DMs) introduces considerable friction: it triggers endless, exhaustive price bargaining (*tawar-menawar*), creates payment security and trust anxieties, and requires manual inventory tracking across fragmented channels. Traditional marketplaces offer infrastructure but fail to provide a personalized, highly curated "digital garage sale" storefront experience that enables casual sellers to market their specific personal lifestyle or aesthetic.

**Kala** eliminates these inefficiencies by providing a unified, catalog-style personal web storefront and dashboard. Indonesian sellers can display their preloved inventory in a curated format, completely outlaw the bargaining phase by enforcing a fixed-price protocol, and route high-intent buyers directly to pre-existing, verified Shopee or Tokopedia product checkout links where secure payment processing and regional logistics are already handled.

### Target Audience & User Personas

#### 1. The Curated Decluttering Seller (Persona A: "Siti, 26, Fashion Enthusiast")
*   **Bio:** An urban professional residing in South Jakarta who frequently declutters her premium wardrobe. She values her time and owns high-quality, authentic preloved fashion items and electronics.
*   **Needs:** A clean, visually cohesive digital catalog to display her curated items without dealing with complex e-commerce backend operations or answering lowball offers in social media comments.
*   **Pain Points:** Hours wasted interacting with non-serious buyers who bargain excessively; the tediousness of setting up heavy storefront settings on major marketplaces for one-off personal items.

#### 2. The High-Intent Frictionless Buyer (Persona B: "Budi, 22, University Student")
*   **Bio:** A tech-savvy consumer based in Bandung hunting for trustworthy secondhand deals, media gear, or streetwear.
*   **Needs:** A fast, transparent interface to browse item conditions, filter listings by specific criteria, and complete purchases instantly through secure, familiar local channels.
*   **Pain Points:** Vulnerability to social media transfer scams; frustration with unindexed listings, hidden pricing ("Cek DM"), and delayed seller response times.

---

## 2. PROJECT SCOPE & GOALS

### High-level Objectives
*   **Streamlined Onboarding:** Empower casual users to register manually or authenticate via Google OAuth, generating a personal storefront URL in under 60 seconds.
*   **Frictionless Inventory Listing:** Enable sellers to publish an item by inputting standard details and an existing Shopee/Tokopedia link, bypassing native payment gateway configurations.
*   **Bargaining Elimination:** Enforce a strict "Fixed Price" system across the web application to protect seller time and standardize buyer expectations.
*   **Intent Tracking Insights:** Provide a minimalist, high-value data dashboard showcasing storefront analytics, item views, and outbound marketplace redirect clicks.
*   **Optimized Discovery Matrix:** Deliver localized, high-speed search and filtering functionalities tailored specifically for Indonesian e-commerce categories and item condition paradigms.

### Out of Scope Items
*   **Native Payment Gateways:** Integration of direct local payment gateways (e.g., Midtrans, Xendit, Instamoney) for checkout processing on the Kala platform itself.
*   **Native Logistics Aggregators:** In-app shipping cost calculators, label generation, or carrier integrations (e.g., JNE, J&T, Sicepat, GoSend).
*   **Direct Messaging (In-App Chat):** Implementation of real-time peer-to-peer chat windows, eliminating channels for negotiation.
*   **Multi-Currency & Internationalization:** System strictly handles Indonesian Rupiah (IDR) and operates entirely within the Indonesian marketplace ecosystem.
*   **Bidding/Auction Engine:** Support for open or closed bidding timelines, up-bidding components, or offer-submission boxes.

---

## 3. FUNCTIONAL REQUIREMENTS & USER STORIES

### 3.1 Authentication & Profile Onboarding

#### User Stories
*   **As a user (Seller/Buyer),** I want to create an account using my email address and a secure password so that I can access the platform securely without relying on third-party integrations.
*   **As a user,** I want to log in instantly using my Google account so that I can skip long registration forms and access my dashboard with one click.
*   **As a newly registered seller,** I want to claim a unique username handle so that my public storefront is reachable via a memorable web URL slug.

#### Acceptance Criteria
*   The system must validate that email inputs follow standard syntax and are globally unique within the database.
*   Passwords must conform to a minimum security strength threshold: at least 8 characters, containing 1 uppercase letter, 1 lowercase letter, and 1 numeric digit.
*   The Google OAuth flow must securely capture `profile.email`, `profile.given_name`, and `profile.picture` from the Google Identity provider.
*   Upon the initial login of a new user, the system must block access to the dashboard until a unique `@username` handle is set.
*   Username input fields must restrict formatting to lowercase alphanumeric characters, hyphens, and underscores, rejecting spaces or special symbols (regex: `^[a-z0-9_-]+$`).
*   The system must dynamically provision a public storefront page mapped directly to the username format: `kala.id/[username]`.

### 3.2 Seller Personal Dashboard & Analytics Engine

#### User Stories
*   **As a seller,** I want to see a numerical summary of my shop’s status at a single glance so that I can monitor my inventory volume.
*   **As a seller,** I want to view a timeline graph of outbound marketplace clicks so that I can measure the commercial interest in my preloved items.

#### Acceptance Criteria
*   The main dashboard screen must display three primary Metric Cards featuring real-time tallies:
    1.  **Total Active Listings:** Count of public items currently discoverable.
    2.  **Total Sold Out/Archived Items:** Historical count of items moved out of rotation.
    3.  **Total Marketplace Redirect Clicks:** Aggregate count of outbound clicks across all listings.
*   The dashboard must render a responsive line or bar chart plotting daily click actions over a user-selectable toggle range: 7 Days, 30 Days, and All-Time.
*   An activity list table must render beneath the chart, showing individual product click totals sorted from highest to lowest.

### 3.3 Item Management & Listing Engine (Fixed Price Protocol)

#### User Stories
*   **As a seller,** I want to upload a new preloved item with images, structured metadata, and outbound shopping links so that buyers can see the details and purchase via trusted channels.
*   **As a seller,** I want to edit or change the status of an item to "Sold Out" or "Archived" so that it instantly hides or updates across public search results.

#### Acceptance Criteria
*   The item creation form must strictly require and validate the following parameters:
    *   **Item Name:** String input, minimum 5 characters, maximum 80 characters.
    *   **Category Selection:** Dropdown input bounded to pre-set enums (`Fashion & Accessories`, `Electronics & Gadgets`, `Books & Literature`, `Home & Living`, `Hobbies & Collectibles`, `Others`).
    *   **Condition Rating:** Dropdown scale option with fixed labels:
        *   `10/10 Like New` (Never used / box opened)
        *   `9/10 Excellent` (No visible flaws, minor wear)
        *   `8/10 Good Condition` (Minor scratches, fully functional)
        *   `7/10 Well Used` (Visible signs of wear, functional imperfections explained)
    *   **Fixed Price (IDR):** Number input field. The user UI must apply an interactive mask auto-formatting values into Indonesian currency layout (e.g., typing `500000` automatically renders `Rp 500.000` in real-time).
    *   **Description:** Multi-line text field, maximum 1000 characters.
    *   **External Marketplace URLs:** Text inputs. The system must perform string regex checks ensuring URLs match legitimate formats for either Shopee Indonesia (`shopee.co.id/...`) or Tokopedia (`tokopedia.com/...`). At least one verified marketplace link must be present to successfully save.
    *   **Image Assets:** Multi-file selector allowing up to 4 images. File constraint limits: Maximum 5MB per file, accepted MIME types: `image/jpeg`, `image/png`, `image/webp`.
*   **Enforcement of Fixed Price:** The listing system shall omit any configuration fields for minimum offers, bidding variables, or open-ended negotiation toggles.

### 3.4 Search, Discovery & Advanced Filtering

#### User Stories
*   **As a buyer,** I want to input keywords into a universal search field so that I can quickly discover specific brands, items, or sellers.
*   **As a buyer,** I want to check categorical filters and adjust price ranges so that I can isolate listings within my budget and platform preference.

#### Acceptance Criteria
*   The search engine must index product titles, item description texts, and user handles, executing full-text lookups with an API response latency of under $300	ext{ms}$.
*   The search landing view must include an instantly adjustable multi-select filtering panel offering:
    *   **Category Filter:** Checkbox list allowing multiple selections.
    *   **Condition Filter:** Checkbox selection grouping scores (`10/10`, `9/10`, `8/10`, `<7/10`).
    *   **Price Range Slider / Minimum & Maximum Inputs:** Bounded number fields that accept currency values, filtering items programmatically where $	ext{Min\_Price} \le 	ext{Item\_Price} \le 	ext{Max\_Price}$.
    *   **Target Marketplace Hub:** Toggle pills for `Shopee Link Available` and `Tokopedia Link Available`.
*   Filters must execute via immediate state refresh/AJAX queries, preventing hard browser reloads.

---

## 4. TECHNICAL & NON-FUNCTIONAL REQUIREMENTS

### Tech Stack Considerations
*   **Frontend Application Layer:** **Next.js (Version 14+ with App Router)** using TypeScript. Leverages Server-Side Rendering (SSR) for static marketplace/listing catalog compilation to optimize search visibility, and client-side react states for filter mutations.
*   **Styling Engine:** **Tailwind CSS** combined with an accessible component primitives utility library (e.g., Radix UI or shadcn/ui) for fully responsive, mobile-first design blocks.
*   **Backend & API Framework:** **Next.js Route Handlers** (Serverless API functions) or a standalone **Node.js (NestJS)** environment running TypeScript to manage underlying validation, routing, and analytics data collation.
*   **Database Management System:** **PostgreSQL** relational database. Database schema interactions, migrations, and structural state mapping are maintained via **Drizzle ORM** or **Prisma ORM** for high efficiency.
*   **Object & Media Storage:** **Cloudinary** or **AWS S3** with an integrated Content Delivery Network (CloudFront) to intercept, resize, optimize, and serve user uploaded images at edge locations.
*   **Session & Security Authentication:** **NextAuth.js** configured with local JWT storage strategies for manual credit validation, and standard OAuth 2.0 adapters for the Google Login provider.

### Performance & Loading Speed Expectations
*   **Core Web Vitals Adherence:** 
    *   Largest Contentful Paint (LCP) must remain under $2.5	ext{ seconds}$ on 3G network environments.
    *   Interaction to Next Paint (INP) / First Input Delay (FID) must clock lower than $100	ext{ms}$.
    *   Cumulative Layout Shift (CLS) must target a strict maximum score of $0.1$.
*   **Image Asset Compression:** Every uploaded raw media asset must pass through an automated backend image rendering pipeline, converting standard formats into highly optimized `.webp` or `.avif` assets compressed to 75% quality metrics, ensuring absolute page weights do not exceed 1.2MB for product loops.

### SEO, Accessibility (WCAG), & Security Rules
*   **Search Engine Optimization (SEO):** Individual product pages must dynamically parse metadata, outputting custom page Titles, canonical links, and OpenGraph (OG) image cards for native sharing on WhatsApp/X. Listings must include valid Schema.org `Product` JSON-LD structures to auto-feed pricing metadata to Google Crawler indexing bots.
*   **Accessibility Standards:** Interface layouts must maintain compliance metrics in accordance with **WCAG 2.1 Level AA** standards. All focusable layout blocks must contain explicit tab ordering, visual interaction borders, form inputs coupled with HTML descriptive labels, and visual contrasts locked at a minimum ratio of $4.5:1$ against the underlying workspace backgrounds.
*   **Application Security Matrix:** Forced global implementation of HTTPS across all staging and production routing zones. Form endpoints must operate with active backend payload verification to defend against Cross-Site Scripting (XSS) and programmatic SQL injection routines. Outbound routing targets must incorporate `rel="noopener noreferrer"` parameters to avoid tab-jacking vulnerabilities.

---

## 5. USER INTERFACE (UI) & WIREFRAME SPECS

### 5.1 Core Architecture Pages

| Page Target | Operational Objective | Primary Interactive CTA |
| :--- | :--- | :--- |
| **Global Marketplace Landing Page** | Value proposition presentation for buyers and sellers; global search box access; randomized masonry displaying newly added preloved inventory items. | "Mulai Buka Katalog Kala" (Get Started Button) |
| **User Public Storefront View** | Personal catalog page summarizing all active, non-sold inventory objects associated with a specific profile handle (`kala.id/@username`). | "Filter Catalog Items" / "Salin Link Toko" |
| **Product Detail View (PDP)** | Isolated high-detail focus view of a chosen product. Exposes condition indicators, user logs, full descriptions, and purchase routers. | "Beli via Shopee" (Orange) / "Beli via Tokopedia" (Green) |
| **Seller Private Dashboard Interface** | Management workspace providing analytics summaries, list iteration logs, item updating drawers, and profile data edits. | "Tambah Item Preloved Baru" (Action Trigger Button) |

### 5.2 Critical Design Layout Components

#### 1. Adaptive Navigation Topbar (Sticky Header)
*   **Left Section:** Prominent minimalist typographic brand logo "**Kala.**" paired adjacent to a wide responsive search input block containing an interior inline magnifying glass vector asset.
*   **Right Section:** Contextual visibility module. If Guest mode $ightarrow$ display a clean text-link button "Masuk" and an accented layout button "Daftar". If Logged-In status $ightarrow$ display an emerald-shaded action button labelled "+ Jual Barang" alongside a circular avatar user profile component featuring a secondary click dropdown menu container.

#### 2. Specialized Non-Bargaining Product detail Grid Matrix
*   **Left Column (60% Desktop Width Grid Block):** Interlocking image stack gallery container. Prominently renders the high-resolution primary photo upload with an asset carousel grid rendering supporting thumbnail variants below. Below the graphic zone, a spacious structured card presents the item text description blocks inside neutral tinted typography settings.
*   **Right Column (40% Desktop Width Sticky Container Block):** A clean floating sidebar panel element featuring:
    *   Product Title in clean H1 structure format.
    *   Condition Tag Indicator: Text pill stating `9/10 Excellent Condition` styled in a desaturated emerald background pill frame with matching text color.
    *   Price Layout Container: High contrast, large format typographic display reading out the immutable fixed price value: e.g., `Rp 1.250.000` (Bold accent presentation).
    *   **The Conversion Outbound Actions Action Bar:** Two high-contrast, brand-colored vector buttons engineered for immediate navigation out:
        1.  *Button Block A (Shopee Orange theme palette `#EE4D2D`):* Displays a bold text layout string reading "**Beli di Shopee**" framed alongside an inline Shopee logo element.
        2.  *Button Block B (Tokopedia Green theme palette `#03AC0E`):* Displays a bold text layout string reading "**Beli di Tokopedia**" framed alongside an inline Tokopedia logo element.
    *   *System Trust Disclaimer Footnote:* Small font subtext reading exactly: `"Transaksi diproses secara aman melalui sistem marketplace yang Anda pilih. Harga bersifat mutlak, bebas dari kerumitan tawar-menawar."`

---

## 6. SUCCESS METRICS (KPIs)

To evaluate the operational validation, market fit, and performance trajectory of the **Kala** platform post-launch, the product team will monitor the following standardized key performance indicators:

*   **Seller Acquisition Rate:** The total volume metric of newly onboarded, fully registered Indonesian sellers who successfully create a profile handle and upload at least one valid preloved product listing within their initial 72 hours.
*   **Inventory Depth Metrics:** The running mean average of live active item listings maintained across active verified seller dashboards over a rolling 30-day monitoring window.
*   **Intent Outbound Conversion Efficiency (Redirect CTR):** Calculated continuously using the mathematical conversion format:
$$	ext{CTR}_{	ext{Outbound}} = \left( rac{	ext{Total Click Events Triggered on Shopee \& Tokopedia Action Buttons}}{	ext{Total Aggregate Unique Product Detail Page (PDP) Views}} ight) 	imes 100$$
*   **Seller Retention Metric:** The percentage proportion of registered sellers who log back into their personal dashboard workspace to add an item, edit existing parameters, or change a listing tag to "Sold Out" at least twice within a 30-day operational lifecycle window.