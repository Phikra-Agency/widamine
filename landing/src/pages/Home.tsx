import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, PhoneCall } from '@phosphor-icons/react'
import { useScheduleModalStore } from '@/stores/scheduleModalStore'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, EffectCoverflow, EffectCreative } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/effect-coverflow'
import 'swiper/css/effect-creative'
import PublicNavbar from '@/components/PublicNavbar'

gsap.registerPlugin(ScrollTrigger)

/* ── Square Moncey CDN images ────────────────────────────────── */

const SM = {
  hero: {
    logo: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66af2514716ef72443f348bc_home-logo-middle.svg',
    topLeft: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66af3565abad49265e1cb980_header-top-left.avif',
    topRight: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66af35669264ecc82de0caaa_header-top-right.avif',
    midRight: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66af3566abad49265e1cb9a8_header-middle-right.avif',
    midLeft: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66af3565abee64cc381d4b75_header-middle-left-vector.svg',
  },
  intro: {
    topLeft: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66af332e5a631306c40e224a_intro-top-left.avif',
    topRight: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66af332ea7af49462f09ea4d_intro-top-right.svg',
    bottomRight: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66af332e716ef72443fb8ca1_intro-bottom-right.avif',
  },
  energie: {
    bubbles: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66aa4ea27518914b10e9001c_section-2-left-bubbles.svg',
  },
  concept: {
    flower: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66b0fbb4c50c3351ead87c66_concept-fleur.avif',
    image: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66b0fbb563b1cf32df3f8e4e_concept-image.avif',
  },
  team: {
    bottomLeft: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66b22d8caadf7a99405e08ed_team-bottom-left.avif',
    flamant: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66ba3959a7134def88b2861e_flammant.avif',
    members: [
      { name: 'Dr Marie JOURDAN', role: 'Dermatologue esthétique', img: 'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/6818e104783e18488c7040f1_maria-jourdan-photo.webp' },
      { name: 'Dr Myriam BITBOL', role: 'Médecin', img: 'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/69538763755ad040d580afe9_474726d3-e7de-4756-8501-41a0d2035149.jpeg' },
      { name: 'Dr Isabelle DUQUENNE', role: 'Médecin', img: 'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/69e1d6078dcf0b6a8a5efdc7_IMG_3136%20-%20Grande.jpeg' },
      { name: 'Tan', role: 'Responsable Relation Patient', img: 'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/6818e12de21066e1b7a3e461_tan-photo.webp' },
      { name: 'Anaëlle', role: 'Assistante Laser', img: 'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/6818e151f8b8bb70e913332b_anaelle-photo.webp' },
      { name: 'Sarah', role: 'Assistante Laser', img: 'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/68ea6759be37ce98f62a0b41_b89ddf20-4be8-4348-90ba-463f078747f3.jpeg' },
    ],
  },
  gallery: [
    'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66e9827c8084de52aefc84f6_Entre%CC%81e%20cabinet.webp',
    'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66f7daae31b9619c9a56fec2_2-salle-dattente.webp',
    'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66f7daf46da5094bf6d5334a_3-bureau.webp',
    'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66f7dbb530eb7fe2c2e15bf5_4-jardin.webp',
    'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66f7dbe7da29663d71b184ad_5-salle-vasculaire.webp',
    'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66f7dc0b733e8f8d49628eff_6-salle%20pigmentaire.webp',
    'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66f7dc20418ca91d088c449a_7-boudoir.webp',
    'https://cdn.prod.website-files.com/669fe584884bb430eb37ac4e/66f7dc38a7350acde7713f8c_8-sous-sol.webp',
  ],
  consult: {
    branch: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/66ba364172b57bbc64c50e1e_consult-branche-feuiille.avif',
    map: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/6607f56f68f48578d6eedfe0_Map-Square-Moncey.webp',
    logo: 'https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/660ea8bba64a65f7285f5015_logo-square-moncey.svg',
  },
}

/* ── Widamine palette ────────────────────────────────────────── */

const C = {
  bg: '#F7F1EB',
  primary: '#2e90c0',
  secondary: '#1a3646',
  accent: '#e8c5b8',
  orange: '#ef6007',
  yellow: '#ffb500',
  green: '#62bca1',
}

/* ── SVG Icons ────────────────────────────────────────────────── */

const RightArrow = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='14' viewBox='0 0 25 25' fill='none'>
    <path d='M0.78047 22.4904L6.74449 16.5264C3.24591 12.2475 3.87845 5.94264 8.15731 2.44411C12.4362-1.05443 18.741-0.421981 22.2396 3.85689C25.7382 8.13575 25.1056 14.4406 20.8268 17.9392C17.1412 20.9527 11.8429 20.9527 8.15727 17.9392L2.19325 23.9032C1.79631 24.2866 1.16376 24.2756 0.780422 23.8786C0.406507 23.4914 0.406507 22.8776 0.78047 22.4904Z' fill='currentColor' />
  </svg>
)

const ArrowLeft = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='14' viewBox='0 0 20 17' fill='none'>
    <path d='M6.49909 1.37685L0.775882 7.1134C0.278934 7.61331 0 8.28956 0 8.99445C0 9.69934 0.278934 10.3756 0.775882 10.8755L6.49909 16.6121C6.74905 16.8605 7.08718 17 7.43962 17C7.79207 17 8.13019 16.8605 8.38015 16.6121C8.50519 16.488 8.60444 16.3405 8.67217 16.1779C8.7399 16.0153 8.77477 15.841 8.77477 15.6649C8.77477 15.4887 8.7399 15.3144 8.67217 15.1518C8.60444 14.9892 8.50519 14.8417 8.38015 14.7177L3.99102 10.3285L18.6659 10.3285C19.0197 10.3285 19.3591 10.188 19.6093 9.93779C19.8594 9.6876 20 9.34827 20 8.99445C20 8.64063 19.8594 8.3013 19.6093 8.05111C19.3591 7.80092 19.0197 7.66037 18.6659 7.66037L3.99102 7.66037L8.38015 3.27124C8.63136 3.0218 8.77319 2.68278 8.77444 2.32876C8.77569 1.97474 8.63626 1.63473 8.38682 1.38351C8.13738 1.1323 7.79835 0.990469 7.44434 0.989217C7.09032 0.987968 6.7503 1.1274 6.49909 1.37685Z' fill='currentColor' />
  </svg>
)

const ArrowRight = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='14' viewBox='0 0 20 17' fill='none'>
    <path d='M13.5009 15.6232L19.2241 9.8866C19.7211 9.38669 20 8.71044 20 8.00555C20 7.30066 19.7211 6.62441 19.2241 6.12449L13.5009 0.387941C13.2509 0.139467 12.9128 0 12.5604 0C12.2079 0 11.8698 0.139467 11.6199 0.387941C11.4948 0.511961 11.3956 0.659512 11.3278 0.822082C11.2601 0.984652 11.2252 1.15902 11.2252 1.33514C11.2252 1.51125 11.2601 1.68563 11.3278 1.8482C11.3956 2.01077 11.4948 2.15832 11.6199 2.28234L16.009 6.67147L1.33408 6.67147C0.980261 6.67147 0.640932 6.81202 0.390743 7.06221C0.140554 7.3124 0 7.65173 0 8.00555C0 8.35937 0.140554 8.6987 0.390743 8.94889C0.640932 9.19907 0.98026 9.33963 1.33408 9.33963L16.009 9.33963L11.6199 13.7288C11.3686 13.9782 11.2268 14.3172 11.2256 14.6712C11.2243 15.0253 11.3637 15.3653 11.6132 15.6165C11.8626 15.8677 12.2016 16.0095 12.5557 16.0108C12.9097 16.012 13.2497 15.8726 13.5009 15.6232Z' fill='currentColor' />
  </svg>
)

const HeartIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='25' height='25' viewBox='0 0 25 25' fill='none'>
    <path d='M12.4777 6.21093C13.2241 6.2143 13.9403 6.50647 14.476 7.02625C15.0117 6.50651 15.7279 6.2143 16.4743 6.21093C18.1832 6.27012 19.5229 7.69917 19.4718 9.40825C19.4718 11.4066 17.4325 13.4679 15.721 14.8437C14.9924 15.424 13.9596 15.424 13.2311 14.8437C11.5195 13.4678 9.48018 11.4066 9.48018 9.40825C9.42915 7.69917 10.7689 6.27012 12.4777 6.21093ZM14.4701 13.2851C16.3225 11.7963 17.4736 10.3075 17.4736 9.40829C17.5234 8.80296 17.0788 8.26938 16.4744 8.2093C15.87 8.26938 15.4253 8.80296 15.4752 9.40829C15.4752 9.96011 15.0279 10.4075 14.476 10.4075C13.9242 10.4075 13.4768 9.96016 13.4768 9.40829C13.5267 8.80296 13.0821 8.26938 12.4776 8.2093C11.8732 8.26938 11.4286 8.80296 11.4785 9.40829C11.4786 10.3075 12.6296 11.7963 14.4701 13.2851Z' fill='currentColor' />
  </svg>
)

const StarIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 18 17' fill='none'>
    <path d='M8.13024 0.533005C8.51342-0.142371 9.48658-0.142372 9.86976 0.533003L11.9616 4.22001C12.1041 4.47108 12.3481 4.64834 12.6308 4.70623L16.7838 5.55636C17.5445 5.71208 17.8453 6.63762 17.3214 7.21075L14.4612 10.3396C14.2665 10.5526 14.1733 10.8394 14.2056 11.1263L14.6804 15.3387C14.7674 16.1103 13.9801 16.6823 13.2731 16.3612L9.4136 14.6079C9.15079 14.4885 8.84921 14.4885 8.5864 14.6079L4.72688 16.3612C4.0199 16.6823 3.23259 16.1103 3.31957 15.3387L3.79439 11.1263C3.82672 10.8395 3.73353 10.5526 3.53877 10.3396L0.678637 7.21075C0.154726 6.63762 0.45545 5.71208 1.21618 5.55636L5.36916 4.70623C5.65195 4.64834 5.89593 4.47108 6.03838 4.22002L8.13024 0.533005Z' fill='currentColor' />
  </svg>
)

const NavArrow = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg xmlns='http://www.w3.org/2000/svg' width='18' height='15' viewBox='0 0 18 15' fill='none'>
    <path d={dir === 'right'
      ? 'M12.3049 14.2008L17.2842 9.20993C17.7165 8.775 17.9592 8.18665 17.9592 7.57338C17.9592 6.96011 17.7165 6.37176 17.2842 5.93682L12.3049 0.945914C12.0874 0.729737 11.7933 0.608398 11.4866 0.608398C11.18 0.608398 10.8858 0.729737 10.6683 0.945914L10.6683 0.945914C10.5596 1.05381 10.4732 1.18219 10.4143 1.32363C10.3554 1.46506 10.325 1.61677 10.325 1.76999C10.325 1.92322 10.3554 2.07492 10.4143 2.21636C10.4732 2.3578 10.5596 2.48618 10.6683 2.59408L14.487 6.4127L1.71952 6.4127C1.41169 6.4127 1.11647 6.53499 0.898798 6.75266C0.681129 6.97032 0.558845 7.26555 0.558845 7.57338C0.558845 7.88121 0.681129 8.17643 0.898798 8.3941C1.11647 8.61177 1.41169 8.73405 1.71952 8.73405L14.487 8.73406L10.6683 12.5527C10.4498 12.7697 10.3264 13.0647 10.3253 13.3727C10.3242 13.6807 10.4455 13.9765 10.6625 14.195C10.8796 14.4136 11.1745 14.537 11.4825 14.5381C11.7905 14.5392 12.0863 14.4179 12.3049 14.2008Z'
      : 'M5.69509 0.799221L0.71582 5.79007C0.283488 6.225 0.040802 6.81335 0.040802 7.42662C0.040802 8.03989 0.283488 8.62824 0.71582 9.06318L5.69509 14.0541C5.91264 14.2703 6.20672 14.3916 6.5134 14.3916C6.82008 14.3916 7.1142 14.2703 7.3317 14.0541L7.3317 14.0541C7.4404 13.9462 7.5268 13.8178 7.5857 13.6764C7.6446 13.5349 7.675 13.3832 7.675 13.23C7.675 13.0768 7.6446 12.9251 7.5857 12.7836C7.5268 12.6422 7.4404 12.5138 7.3317 12.4059L3.513 8.5873L16.2805 8.5873C16.5883 8.5873 16.8835 8.46501 17.1012 8.24734C17.3189 8.02968 17.4412 7.73445 17.4412 7.42662C17.4412 7.11879 17.3189 6.82357 17.1012 6.6059C16.8835 6.38823 16.5883 6.26595 16.2805 6.26595L3.513 6.26595L7.3317 2.4473C7.5502 2.23033 7.6736 1.93532 7.6747 1.62732C7.6758 1.31931 7.5545 1.02347 7.3375 0.805034C7.1204 0.586599 6.8255 0.463208 6.5175 0.462066C6.2095 0.460923 5.91466 0.582297 5.6961 0.800769L5.69509 0.799221Z'
    } fill='currentColor' />
  </svg>
)

/* ── Plant SVG Icons (from Square Moncey) ────────────────────── */

const PlantIcon = ({ color }: { color: string }) => (
  <svg xmlns='http://www.w3.org/2000/svg' width='44' height='91' viewBox='0 0 44 91' fill='none'>
    <path d='M13.7736 64.6343C9.42909 66.5848 7.62586 70.846 7.77719 75.6056C7.92851 80.3651 10.9247 86.6199 15.1469 88.8223C19.3696 91.0242 24.6402 90.9164 28.9173 88.8223C33.2328 86.7096 36.6254 80.5319 36.4075 75.732C36.1991 71.1419 32.9537 67.3338 29.8782 63.9203C30.1378 63.5547 30.6852 58.9374 31.092 55.1963L13.6142 54.2195L13.7736 64.6343Z' fill='currentColor' />
    <path d='M36.7295 25.8855C34.9362 26.1773 33.0686 26.4655 31.3293 25.9404C29.5899 25.4153 28.0304 23.8168 28.1863 22.0068C28.4047 19.4704 31.5146 18.3341 34.06 18.3024C36.6053 18.2707 39.4556 18.6554 41.4197 17.0361C42.914 15.8037 43.4133 13.5129 42.5678 11.7704C41.7224 10.0279 39.6133 9.00257 37.7208 9.41397C35.3544 9.92821 33.8819 12.2226 31.9468 13.6779C30.0117 15.1332 26.3939 15.1377 25.9721 12.7531C25.4909 10.0306 29.7299 8.85442 30.5346 6.20936C30.9818 4.73913 30.1903 3.10625 28.9737 2.16702C27.7572 1.22779 26.2018 0.855815 24.6813 0.633355C22.7222 0.346558 20.6575 0.280416 18.8294 1.04068C17.0012 1.80049 15.4757 3.56113 15.511 5.54062C15.5459 7.48658 16.9758 9.07733 17.892 10.7949C18.8081 12.5121 18.987 15.0906 17.2635 15.9953C14.9397 17.2159 12.8152 14.0988 10.4429 12.9756C8.19748 11.9127 5.1877 12.9847 4.1198 15.2278C3.0519 17.471 4.11708 20.4831 6.35754 21.556C8.53503 22.5989 11.094 21.8645 13.508 21.8156C15.922 21.7666 18.8846 23.1363 18.7474 25.5466C18.6654 26.9915 17.4026 28.1473 16.0235 28.5863C14.6443 29.0254 13.1591 28.9044 11.7147 28.8083C8.67729 28.6067 5.3558 28.6203 2.95087 30.4865C0.545946 32.3528 0.0724764 36.7594 2.77825 38.1539C4.51715 39.0501 6.64162 38.3352 8.35742 37.3946C10.0728 36.454 11.7768 35.2601 13.7318 35.194C15.6873 35.1278 17.8353 36.9025 17.2413 38.7665C16.8299 40.0564 15.3629 40.6921 14.0186 40.8525C12.6743 41.0128 11.2748 40.866 9.99665 41.3123C7.73218 42.1034 6.41282 44.9125 7.24965 47.1606C8.08693 49.4088 10.9218 50.6706 13.1528 49.788C15.0924 49.0205 16.2351 47.0691 17.5 45.4104C18.765 43.7517 20.6752 42.1569 22.7104 42.6136C25.5063 43.2406 26.0981 46.9345 27.9865 49.0898C29.304 50.5936 31.5128 51.3466 33.4071 50.7073C35.3014 50.0685 36.6375 47.9286 36.1473 45.9903C35.5066 43.4581 32.5757 42.4387 30.2668 41.2167C27.9579 39.9943 25.8117 36.9628 27.542 35.0055C28.6217 33.7845 30.5885 33.9023 32.0918 34.5316C33.5951 35.1609 34.9398 36.1939 36.5301 36.5509C39.3387 37.1816 42.4695 35.2157 43.1215 32.4121C43.7735 29.6085 41.7976 27.1287 40.0935 25.1733C39.8339 24.8758 39.5646 24.5875 39.2865 24.3085L36.7295 25.8855Z' fill={color} />
  </svg>
)

const VaseIcon = ({ color }: { color: string }) => (
  <svg xmlns='http://www.w3.org/2000/svg' width='50' height='94' viewBox='0 0 50 94' fill='none'>
    <path d='M17.6799 54.7661C19.1201 52.5061 19.0139 49.6408 17.6673 47.3233C17.2025 46.5234 17.0093 45.7193 17.4548 45.2908C18.4447 44.3382 19.961 44.2107 21.3316 44.3144C22.7015 44.418 24.1009 44.695 25.431 44.3512C28.9054 43.453 30.6673 38.706 34.2535 38.5772C35.0113 38.5501 35.9299 38.9273 35.9824 39.6835C36.038 40.4839 35.1377 40.9509 34.4374 41.3442C32.222 42.5877 30.8542 45.1983 31.0932 47.7278C31.322 50.1562 32.8693 52.266 34.6319 53.9517C36.3945 55.6374 38.4257 57.0401 40.0606 58.8507C43.8292 63.025 45.0781 69.3133 43.1918 74.6111C41.7405 78.6866 38.6489 82.4219 37.009 86.4491C35.8851 89.2089 33.2759 91.0771 30.3093 91.3621C30.2347 91.3693 30.1602 91.3765 30.0863 91.3836C27.2725 91.6526 24.5702 90.4015 22.8253 88.1782C20.2581 84.9073 16.3606 82.4123 13.792 79.0892C10.796 75.2133 9.71635 69.9253 10.954 65.1855C11.9301 61.4458 15.2919 58.5124 17.6799 54.7661Z' fill='currentColor' />
    <path d='M14.2767 61.0182C13.2916 59.6946 12.1407 58.4926 10.9222 57.2214C9.96333 56.2197 8.97142 55.1842 8.05233 54.0698C5.29866 50.7302 3.97174 47.4123 4.10723 44.2095C4.27336 40.2811 7.37892 36.0106 11.7493 35.9623C14.2244 35.9235 16.7593 37.2776 18.5317 39.584C19.9803 41.4691 20.7759 43.6819 21.4768 45.6344L17.781 46.9616C17.1476 45.1981 16.4926 43.3743 15.4181 41.9767C14.4135 40.6698 13.0311 39.8698 11.8098 39.8884C9.76422 39.921 8.11926 42.2839 8.0304 44.3761C7.93708 46.5817 8.96398 49.003 11.0822 51.572C11.9085 52.5736 12.8069 53.512 13.7585 54.5052C15.0058 55.8073 16.2963 57.1545 17.4266 58.6733L14.2767 61.0182Z' fill='currentColor' />
    <path d='M9.36928 26.0557C10.0357 17.7972 20.3462 29.1732 23.2329 26.2415C20.5139 20.8917 7.01425 20.0184 11.0218 11.9232C16.7409 5.75273 20.156 19.17 24.6317 18.4568C24.2756 13.8859 20.0646 10.6464 19.8446 6.01062C18.5327 0.159241 25.2382 0.69876 26.5805 5.32066C28.6804 7.09712 28.3705 15.5904 31.2934 14.2896C37.7225-5.45373 46.0284 10.0167 33.7313 22.5589C29.3734 33.8744 40.852 15.0468 43.5434 18.8468C44.9125 24.7539 39.8098 30.0743 34.0682 32.8493C30.8693 34.3952 27.1624 34.4665 23.8256 33.2467C18.7095 31.3766 10.4079 33.2055 9.36928 26.0557Z' fill={color} />
  </svg>
)

const FlowerIcon = ({ color }: { color: string }) => (
  <svg xmlns='http://www.w3.org/2000/svg' width='44' height='94' viewBox='0 0 44 94' fill='none'>
    <path d='M15.5078 91.367L24.7555 92.1761C27.1821 92.3884 29.442 90.9616 30.3233 88.6906C31.5216 85.6039 33.2547 82.6413 34.7331 79.7368C36.8062 75.6649 38.4612 71.0279 37.3838 66.5871C36.3063 62.1468 31.4768 58.4089 27.1976 60.0101L28.5164 53.3668L20.4766 52.3339L20.5861 59.8296C16.581 58.0721 11.5988 60.0753 9.10387 63.6675C6.60885 67.2602 6.2799 72.0093 7.2318 76.2782C7.99406 79.6968 9.49291 82.8859 10.7079 87.3808C11.3037 89.5847 13.2334 91.1681 15.5078 91.367Z' fill='currentColor' />
    <path d='M14.7062 29.9963C12.0308 26.9437 6.19855 25.2227 6.65014 20.4075C8.62293 16.9743 12.3739 19.8038 14.5152 21.505C17.7635 17.9686 10.2882 11.4424 12.4373 6.58637C17.3312 1.61461 20.0722 15.6112 22.4791 12.86C25.5476 11.073 25.1314 7.32487 26.3904 4.46753C30.1049-1.5194 35.6536 6.06913 33.6664 10.6815C33.3974 11.3055 33.5356 12.5028 33.301 13.2458C32.9522 14.35 32.4047 15.381 32.0207 16.4716C31.531 17.8613 31.0211 21.6259 33.8552 20.4031C34.4629 20.1408 34.9422 19.6582 35.4475 19.2302C39.4894 15.808 40.1683 23.2367 39.8933 25.6525C39.4358 29.6712 35.615 31.2 32.0736 31.8448C22.936 33.6579 34.8671 46.4316 25.8405 49.5679C22.6481 49.9093 21.3049 45.3474 20.3242 42.9592C18.4218 39.6131 13.3863 39.5244 11.2208 36.1931C6.23032 29.3435 18.1428 34.1549 14.7062 29.9963Z' fill={color} />
  </svg>
)

const QuoteIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='35' height='41' viewBox='0 0 35 41' fill='none'>
    <path d='M17.5006 0.875C12.8609 0.880734 8.4129 2.72638 5.13214 6.00714C1.85138 9.2879 0.00573373 13.7359 0 18.3756C0 23.0858 3.66679 29.6527 10.902 37.8913C11.7271 38.8289 12.7425 39.5799 13.8806 40.0944C15.0187 40.6089 16.2533 40.875 17.5023 40.875C18.7512 40.875 19.9859 40.6089 21.1239 40.0944C22.262 39.5799 23.2774 38.8289 24.1025 37.8913C31.3344 29.6543 35.0012 23.0874 35.0012 18.3756C34.9955 13.7359 33.1498 9.2879 29.8691 6.00714C26.5883 2.72638 22.1403 0.880734 17.5006 0.875ZM20.344 34.5945C19.9806 34.9852 19.5405 35.2968 19.0513 35.5099C18.5621 35.723 18.0342 35.8329 17.5006 35.8329C16.967 35.8329 16.4391 35.723 15.9499 35.5099C15.4607 35.2968 15.0206 34.9852 14.6572 34.5945C8.51863 27.6026 4.99017 21.6907 4.99017 18.3773C4.99017 15.062 6.30718 11.8824 8.65146 9.53813C10.9957 7.19385 14.1753 5.87684 17.4906 5.87684C20.8059 5.87684 23.9855 7.19385 26.3297 9.53813C28.674 11.8824 29.991 15.062 29.991 18.3773C30.001 21.6907 26.4826 27.6026 20.344 34.5945Z' fill='currentColor' />
    <path d='M17.5007 10.9668C16.0624 10.9668 14.6565 11.3933 13.4606 12.1923C12.2648 12.9914 11.3327 14.1271 10.7823 15.4559C10.2319 16.7846 10.0879 18.2468 10.3685 19.6574C10.6491 21.068 11.3417 22.3637 12.3587 23.3807C13.3757 24.3977 14.6714 25.0903 16.082 25.3709C17.4926 25.6515 18.9548 25.5075 20.2835 24.9571C21.6123 24.4067 22.748 23.4746 23.5471 22.2788C24.3461 21.0829 24.7726 19.677 24.7726 18.2387C24.7704 16.3108 24.0035 14.4624 22.6403 13.0991C21.277 11.7359 19.4286 10.969 17.5007 10.9668ZM17.5007 20.5105C17.0514 20.5105 16.6122 20.3772 16.2386 20.1276C15.865 19.878 15.5738 19.5232 15.4019 19.1081C15.2299 18.693 15.1849 18.2362 15.2726 17.7955C15.3602 17.3548 15.5766 16.9501 15.8943 16.6323C16.212 16.3146 16.6168 16.0983 17.0575 16.0106C17.4982 15.923 17.9549 15.968 18.37 16.1399C18.7851 16.3118 19.1399 16.603 19.3896 16.9766C19.6392 17.3502 19.7724 17.7894 19.7724 18.2387C19.772 18.8411 19.5325 19.4187 19.1066 19.8446C18.6806 20.2705 18.103 20.51 17.5007 20.5105Z' fill='currentColor' />
  </svg>
)

/* ── Content ──────────────────────────────────────────────────── */

const QUOTES = [
  '"La nature nous donne la beauté, la sagesse nous aide à la révéler."',
  '"La beauté réside dans la vérité."',
  '"La simplicité est la sophistication suprême."',
  '"La beauté commence au moment où vous décidez d\'être vous-même."',
  '"Je vous souhaite d\'être au lieu de paraître."',
  '"On ne peut percevoir la beauté qu\'avec un esprit serein."',
]

const TESTIMONIALS = [
  { name: 'Sara C.', text: 'Après plusieurs années à chercher la bonne approche pour ma rosacée, j\'ai enfin trouvé une équipe qui comprend vraiment ma peau. Les résultats parlent d\'eux-mêmes. Une équipe passionnée et à l\'écoute.' },
  { name: 'Hila S.', text: 'Un centre innovant et magnifique. Dès qu\'on franchit la porte, on ressent une vraie bienveillance. Les méthodes proposées donnent des résultats durables. Je recommande 1000 fois !' },
  { name: 'Marine D.', text: 'Je sors ravie de chaque consultation. Un espace apaisant, élégant et raffiné. Merci pour votre écoute, votre professionnalisme et vos précieux conseils.' },
  { name: 'Guillaume C.', text: 'Une expérience exceptionnelle. L\'accueil chaleureux et les conseils avisés lors de ma consultation ont été extrêmement précieux. Je recommande vivement ce centre pour la qualité de ses services !' },
  { name: 'Romina S.', text: 'Grâce à leur expertise, ma peau pleine de taches et cicatrices d\'acné a pu retrouver sa forme. Un accompagnement personnalisé et des résultats visibles. Je conseille à 1000% ce centre.' },
  { name: 'Nadia T.', text: 'Un centre où chaque détail a été pensé pour le bien-être des patients. Une équipe compétente qui sait allier expertise médicale et sens du service. Une vraie découverte.' },
]

const TEAM_ICONS = ['#62bca1', '#62bca1', '#62bca1', '#ffb500', C.primary, C.primary]

/* ── Sections ─────────────────────────────────────────────────── */

function HeroSection() {
  const heroRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { open } = useScheduleModalStore()
  const [isPlaying, setIsPlaying] = useState(true)

  const toggleVideo = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-fade]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.15 })
    }, heroRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} className='relative' style={{ background: C.bg, minHeight: '100svh' }}>
      <div className='relative z-10 mx-auto max-w-7xl px-4 sm:px-6 text-center pt-32 sm:pt-40 lg:pt-48'>
        <img src='/logo.png' alt='Widamine' data-fade className='mx-auto w-12 sm:w-14 lg:w-16' />
        <h1 data-fade className='mt-10 font-amoria text-[2.2rem] leading-[1.08] sm:text-5xl md:text-6xl' style={{ color: C.secondary }}>
          Bienvenue à <span style={{ color: C.primary, fontStyle: 'italic' }}>Widamine</span>
          <br className='hidden sm:block' />
          Centre de dermato-esthétique
        </h1>
        <p data-fade className='mx-auto mt-6 max-w-xl text-base leading-7' style={{ color: `${C.secondary}99` }}>
          1er centre médical de Dermato-Esthétique, Bodycontouring et Lasers au Maroc.
        </p>
        <div data-fade className='mt-10 flex flex-wrap items-center justify-center gap-4'>
          <button onClick={open} className='inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl' style={{ background: C.secondary }}>
            Prendre rendez-vous <RightArrow />
          </button>
          <Link to='/services/consultation' className='inline-flex items-center gap-2.5 rounded-full border-2 px-7 py-3.5 text-sm font-semibold transition-all hover:-translate-y-0.5' style={{ borderColor: C.primary, color: C.primary }}>
            Consultation <RightArrow />
          </Link>
        </div>
      </div>

      <div className='max-w-4xl mx-auto px-4 mt-20 sm:mt-28 pb-16 relative z-20' data-video-wrap>
        <div data-fade className='overflow-hidden rounded-[2rem] relative group' style={{ aspectRatio: '16/9', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.25), 0 8px 24px -8px rgba(0,0,0,0.15)' }}>
          <img src='https://cdn.prod.website-files.com/6605bb62a0c4eb429d0631b4/660ea71c6f94851cc9dbd4a9_cabine1.jpg' alt='' className='absolute inset-0 h-full w-full object-cover widamine-tint' loading='eager' />
          <video ref={videoRef} autoPlay muted loop playsInline className='absolute inset-0 h-full w-full object-cover'>
            <source src='https://cdn.pixabay.com/video/2020/07/30/45349-445002403_large.mp4' type='video/mp4' />
          </video>
          <button
            onClick={toggleVideo}
            className='absolute bottom-4 right-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-all hover:bg-white/30'
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? (
              <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'><rect x='6' y='4' width='4' height='16' rx='1'/><rect x='14' y='4' width='4' height='16' rx='1'/></svg>
            ) : (
              <svg width='16' height='16' viewBox='0 0 24 24' fill='currentColor'><path d='M8 5v14l11-7z'/></svg>
            )}
          </button>
        </div>
      </div>

      <div className='absolute inset-0 pointer-events-none'>
        <img src={SM.hero.topLeft} alt='' className='absolute left-0 top-0 w-44 sm:w-56 opacity-60 widamine-tint' loading='lazy' />
        <img src={SM.hero.topRight} alt='' className='absolute right-0 top-0 w-44 sm:w-56 opacity-60 widamine-tint' loading='lazy' />
        <img src={SM.hero.midRight} alt='' className='absolute right-0 top-1/3 w-36 sm:w-44 opacity-50 widamine-tint' loading='lazy' />
        <img src={SM.hero.midLeft} alt='' className='absolute left-0 bottom-0 w-44 sm:w-56 opacity-50 widamine-tint' loading='lazy' />
      </div>
    </section>
  )
}

function IntroSection() {
  return (
    <section className='relative py-24 sm:py-32 lg:py-40' style={{ background: C.bg }}>
      <div className='mx-auto max-w-4xl px-4 sm:px-6 text-center relative z-10'>
        <h2 className='font-amoria text-3xl leading-tight sm:text-4xl md:text-5xl' style={{ color: C.secondary }}>
          Bienvenue à Widamine <span style={{ color: C.primary, fontStyle: 'italic' }}>Aesthetic Center</span>
        </h2>
        <p className='mx-auto mt-8 max-w-[700px] text-base leading-8' style={{ color: `${C.secondary}a6` }}>
          Ici, chaque traitement est une promesse d'excellence. Grâce à une combinaison unique de technologies de pointe et de savoir-faire expert, nous vous aidons à redécouvrir votre beauté et à retrouver une peau saine et éclatante.
        </p>
      </div>
      <img src={SM.intro.topLeft} alt='' className='absolute left-0 top-0 w-36 sm:w-48 opacity-40 widamine-tint' loading='lazy' />
      <img src={SM.intro.topRight} alt='' className='absolute right-0 top-0 w-36 sm:w-48 opacity-40 widamine-tint' loading='lazy' />
      <img src={SM.intro.bottomRight} alt='' className='absolute right-0 bottom-0 w-40 sm:w-52 opacity-40 widamine-tint' loading='lazy' />
    </section>
  )
}


function ConceptSection() {
  return (
    <section className='relative py-24 sm:py-32 lg:py-40' style={{ background: C.bg }}>
      <div className='mx-auto max-w-7xl px-4 sm:px-6'>
        <div className='grid gap-12 lg:grid-cols-2 lg:items-center'>
          <div className='relative'>
            <div className='overflow-hidden rounded-[2rem]' style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)' }}>
              <img src={SM.concept.image} alt='Concept Widamine' className='h-full w-full object-cover widamine-tint' loading='lazy' style={{ minHeight: 320 }} />
            </div>
            <img src={SM.concept.flower} alt='' className='absolute -bottom-8 -right-8 w-32 sm:w-44 opacity-70 widamine-tint' loading='lazy' />
          </div>
          <div>
        <h2 className='font-amoria text-3xl leading-tight sm:text-4xl md:text-5xl' style={{ color: C.secondary }}>
          Notre <span style={{ color: C.primary, fontStyle: 'italic' }}>Objectif</span>
        </h2>
        <p className='mt-8 text-base leading-8' style={{ color: `${C.secondary}a6` }}>
          Nous visons à dépasser les attentes en offrant des soins dermatologiques et esthétiques exceptionnels, conçus pour chaque individu.
        </p>
        <p className='mt-4 text-base leading-8' style={{ color: `${C.secondary}a6` }}>
          Notre priorité est d'utiliser les techniques les plus avancées pour assurer des résultats optimaux et durables.
        </p>
        <Link to='/contact' className='inline-flex items-center gap-2.5 mt-8 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl' style={{ background: C.primary }}>
          Nous contacter <RightArrow />
        </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function MethodeSection() {
  const cards = [
    {
      cat: 'visage',
      label: 'Traitements du visage',
      desc: 'Facial Aesthetics, Esthétique des lèvres, de l\'œil, des sourcils et consultation personnalisée.',
      icon: PlantIcon,
      bg: C.primary,
      link: '/services/facial-aesthetics',
    },
    {
      cat: 'corps',
      label: 'Traitements du corps',
      desc: 'Body Aesthetics, Breast Aesthetics, BBL, Liposuccion, Vaser, Épilation laser et plus.',
      icon: VaseIcon,
      bg: C.green,
      link: '/services/body-aesthetics',
    },
    {
      cat: 'techniques',
      label: 'Épilation laser',
      desc: 'Épilation définitive laser pour toutes les zones du corps et du visage.',
      icon: FlowerIcon,
      bg: C.yellow,
      link: '/services/epilation-laser',
    },
  ]

  return (
    <section className='relative py-24 sm:py-32 lg:py-40' style={{ background: C.bg }}>
      <div className='mx-auto max-w-7xl px-4 sm:px-6'>
        <h2 className='text-center font-amoria text-3xl leading-tight sm:text-4xl md:text-5xl' style={{ color: C.secondary }}>
          <span style={{ color: C.primary, fontStyle: 'italic' }}>Nos traitements</span>
        </h2>
        <p className='mx-auto mt-4 max-w-lg text-center text-sm leading-7' style={{ color: `${C.secondary}99` }}>
          Des soins dermatologiques et esthétiques pour le visage et le corps, adaptés à chaque besoin.
        </p>
        <div className='mt-14 grid gap-6 sm:grid-cols-3' data-methode-wrap>
          {cards.map((card, i) => {
            const Icon = card.icon
            return (
              <Link
                key={i}
                to={card.link}
                data-methode-item={i === 0 ? 'first' : i === 2 ? 'third' : 'second'}
                className='group relative flex flex-col overflow-hidden rounded-[2rem] p-8 text-white shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl'
                style={{ background: card.bg }}
              >
                <div className='mb-6 h-16 flex items-end'>
                  <Icon color='white' />
                </div>
                <h3 className='text-xl font-semibold'>{card.label}</h3>
                <p className='mt-3 text-sm leading-6 text-white/75'>{card.desc}</p>
                <div className='mt-auto pt-8 flex items-center gap-2 text-sm font-medium text-white/80 group-hover:text-white transition-all'>
                  Découvrir <RightArrow />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
      <img src={SM.energie.bubbles} alt='' className='absolute left-0 bottom-0 opacity-20 hidden lg:block w-48 widamine-tint' loading='lazy' />
    </section>
  )
}

function TeamSection() {
  return (
    <section className='relative py-24 sm:py-32 lg:py-40' style={{ background: C.bg }}>
      <div className='mx-auto max-w-7xl px-4 sm:px-6'>
        <h2 className='text-center font-amoria text-3xl leading-tight sm:text-4xl md:text-5xl' style={{ color: C.secondary }}>
          <span style={{ color: C.primary, fontStyle: 'italic' }}>L'équipe</span> du Widamine Center
        </h2>
        <div className='mt-14'>
          <Swiper
            modules={[Autoplay, Navigation]}
            navigation={{ prevEl: '.team-prev', nextEl: '.team-next' }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            slidesPerView={3}
            spaceBetween={24}
            speed={600}
            loop
            className='team-swiper py-8'
          >
            {SM.team.members.map((m, i) => (
              <SwiperSlide key={i}>
                <article className='overflow-hidden rounded-[2rem] border border-black/5 bg-white transition-all duration-300 hover:-translate-y-1 h-full' style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)' }}>
                  <div className='relative h-72 overflow-hidden'>
                    <img src={m.img} alt={m.name} className='h-full w-full object-cover' loading='lazy' />
                  </div>
                  <div className='p-6 text-center'>
                    <div className='mx-auto mb-3 h-10 w-10 rounded-full flex items-center justify-center' style={{ background: TEAM_ICONS[i] }}>
                      <svg width='20' height='20' viewBox='0 0 24 24' fill='white'><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>
                    </div>
                    <h3 className='text-lg font-semibold' style={{ color: C.secondary }}>{m.name}</h3>
                    <p className='mt-1 text-xs font-medium' style={{ color: C.primary }}>{m.role}</p>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className='mt-6 flex justify-center gap-3'>
            <button className='team-prev flex h-9 w-9 items-center justify-center rounded-full text-white transition-all hover:scale-105' style={{ background: C.primary }} aria-label='Précédent'>
              <ArrowLeft />
            </button>
            <button className='team-next flex h-9 w-9 items-center justify-center rounded-full text-white transition-all hover:scale-105' style={{ background: C.primary }} aria-label='Suivant'>
              <ArrowRight />
            </button>
          </div>
        </div>
      </div>
      <img src={SM.team.bottomLeft} alt='' className='absolute left-0 bottom-0 w-40 opacity-40 hidden lg:block widamine-tint' loading='lazy' />
      <img src={SM.team.flamant} alt='' className='absolute right-0 top-1/4 w-36 opacity-40 hidden lg:block widamine-tint' loading='lazy' />
    </section>
  )
}

function GallerySection() {
  return (
    <section className='relative py-24 sm:py-32 lg:py-40' style={{ background: C.bg }}>
      <div className='mx-auto max-w-7xl px-4 sm:px-6'>
        <h2 className='text-center font-amoria text-3xl leading-tight sm:text-4xl md:text-5xl mb-14' style={{ color: C.secondary }}>
          <span style={{ color: C.primary, fontStyle: 'italic' }}>Notre</span> espace
        </h2>
        <Swiper
          modules={[Autoplay, Navigation, EffectCoverflow]}
          effect='coverflow'
          grabCursor
          centeredSlides
          slidesPerView={3}
          spaceBetween={24}
          coverflowEffect={{ rotate: 0, stretch: 0, depth: 200, modifier: 1.5, slideShadows: false }}
          navigation={{ prevEl: '.gallery-prev', nextEl: '.gallery-next' }}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          speed={600}
          loop
          className='gallery-swiper'
        >
          {SM.gallery.map((src, i) => (
            <SwiperSlide key={i}>
              <div className='h-[250px] sm:h-[300px] overflow-hidden rounded-2xl mx-2' style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)' }}>
                <img src={src} alt={`Espace ${i + 1}`} className='h-full w-full object-cover transition-transform duration-500 hover:scale-110' loading='lazy' />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className='mt-6 flex justify-center gap-3'>
          <button className='gallery-prev flex h-9 w-9 items-center justify-center rounded-full text-white transition-all hover:scale-105' style={{ background: C.primary }} aria-label='Précédent'>
            <ArrowLeft />
          </button>
          <button className='gallery-next flex h-9 w-9 items-center justify-center rounded-full text-white transition-all hover:scale-105' style={{ background: C.primary }} aria-label='Suivant'>
            <ArrowRight />
          </button>
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section className='relative py-24 sm:py-32 lg:py-40' style={{ background: C.bg }}>
      <div className='mx-auto max-w-7xl px-4 sm:px-6'>
        <h2 className='text-center font-amoria text-3xl leading-tight sm:text-4xl md:text-5xl mb-14' style={{ color: C.secondary }}>
          Les <span style={{ color: C.primary, fontStyle: 'italic' }}>Témoignages</span> de nos patientes
        </h2>
        <Swiper
          modules={[Autoplay, Navigation]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          centeredSlides
          slidesPerView={3}
          spaceBetween={24}
          speed={600}
          loop
          grabCursor
          navigation={{ prevEl: '.test-prev', nextEl: '.test-next' }}
          className='test-swiper py-8'
        >
          {TESTIMONIALS.map((t, i) => (
            <SwiperSlide key={i}>
              <div className='rounded-[2rem] bg-white p-8 border border-black/5 flex flex-col' style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.12)', height: 280 }}>
                <div className='flex items-center gap-1 text-[#ffb500] mb-4'>
                  {Array.from({ length: 5 }).map((_, j) => <StarIcon key={j} />)}
                </div>
                <p className='text-sm leading-6 mb-6 flex-1' style={{ color: `${C.secondary}b3` }}>"{t.text}"</p>
                <p className='font-semibold text-sm' style={{ color: C.secondary }}>{t.name}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className='mt-6 flex justify-center gap-3'>
          <button className='test-prev flex h-9 w-9 items-center justify-center rounded-full text-white transition-all hover:scale-105' style={{ background: C.primary }} aria-label='Précédent'>
            <ArrowLeft />
          </button>
          <button className='test-next flex h-9 w-9 items-center justify-center rounded-full text-white transition-all hover:scale-105' style={{ background: C.primary }} aria-label='Suivant'>
            <ArrowRight />
          </button>
        </div>
      </div>
    </section>
  )
}

function ConsultSection() {
  const { open } = useScheduleModalStore()

  return (
    <section className='relative py-24 sm:py-32 lg:py-40' style={{ background: C.bg }}>
      <div className='mx-auto max-w-7xl px-4 sm:px-6'>
        <div className='grid gap-12 lg:grid-cols-2 lg:items-center'>
          <div>
              <h2 className='font-amoria text-3xl leading-tight sm:text-4xl md:text-5xl' style={{ color: C.secondary }}>
                Comment <span style={{ color: C.primary, fontStyle: 'italic' }}>prendre rendez-vous</span> au Widamine Center ?
              </h2>
              <p className='mt-4 text-base leading-8' style={{ color: `${C.secondary}a6` }}>
                La consultation en présentiel ou la visio-consultation (qui permet souvent de diminuer le délai).
              </p>
              <div className='mt-8 space-y-4'>
                <div className='flex items-start gap-4'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full' style={{ background: `${C.primary}1a` }}>
                    <PhoneCall className='h-5 w-5' style={{ color: C.primary }} />
                  </div>
                  <div>
                    <p className='font-semibold' style={{ color: C.secondary }}>Par téléphone</p>
                    <p className='text-sm' style={{ color: `${C.secondary}99` }}>+212 (535) 624 696</p>
                  </div>
                </div>
                <div className='flex items-start gap-4'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full' style={{ background: `${C.primary}1a` }}>
                    <MapPin className='h-5 w-5' style={{ color: C.primary }} />
                  </div>
                  <div>
                    <p className='font-semibold' style={{ color: C.secondary }}>En personne</p>
                    <p className='text-sm' style={{ color: `${C.secondary}99` }}>Boulevard Slaoui, Bureaux Nour, 2ème étage, Fès</p>
                  </div>
                </div>
              </div>
            <button onClick={open} className='mt-8 inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl' style={{ background: C.primary }}>
              Prendre rendez-vous <RightArrow />
            </button>
          </div>
          <div className='w-full overflow-hidden rounded-[2rem] relative' style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)' }}>
            <iframe
              src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3303.2!2d-4.9794!3d34.0364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd9f8b6f5f5f5f5f%3A0x0!2zQm91bGV2YXJkIFNsYW91aSwgRsOocw!5e0!3m2!1sfr!2sma!4v1'
              width='100%'
              height='380'
              style={{ border: 0 }}
              allowFullScreen
              loading='lazy'
              referrerPolicy='no-referrer-when-downgrade'
              className='w-full'
            />
          </div>
        </div>
      </div>
      <img src={SM.consult.branch} alt='' className='absolute left-0 bottom-0 w-40 opacity-40 hidden lg:block widamine-tint' loading='lazy' />
    </section>
  )
}

/* ── GSAP Animations ──────────────────────────────────────────── */

function useGSAPAnimations() {
  useEffect(() => {
    const scroller = '#app-scroll'
    const ctx = gsap.context(() => {
      // Navbar show/hide
      ScrollTrigger.create({
        trigger: 'body',
        scroller,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const nav = document.querySelector('[data-public-nav]')
          if (!nav) return
          if (self.direction === 1) gsap.to(nav, { y: '-100%', duration: 0.6, ease: 'power2.inOut' })
          else gsap.to(nav, { y: '0%', duration: 0.6, ease: 'power2.inOut' })
        },
      })

      // Fade-in animations on scroll
      gsap.utils.toArray<HTMLElement>('[data-fade-scroll]').forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 30 }, {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: el, scroller, start: 'top 85%', toggleActions: 'play none none none' },
        })
      })

      // Method cards rotation on scroll (desktop)
      gsap.matchMedia().add('(min-width: 992px)', () => {
        gsap.timeline({
          scrollTrigger: {
            trigger: '[data-methode-wrap]',
            scroller,
            start: '-5% center',
            end: '50% 40%',
            scrub: 1.5,
          },
        }).to('[data-methode-item="first"]', { rotation: -8 })
          .to('[data-methode-item="third"]', { rotation: 8 }, '<')
          .to('[data-methode-item="second"]', { y: '-2rem' }, '<')
      })

      // Hero video scale on scroll
      gsap.timeline({
        scrollTrigger: {
          trigger: '[data-video-wrap]',
          scroller,
          start: 'top 90%',
          end: 'top 20%',
          scrub: 2,
        },
      }).fromTo('[data-video-wrap] > div', { scale: 0.85, y: 40 }, { scale: 1, y: 0 })
    })

    return () => ctx.revert()
  }, [])
}

/* ── Page ──────────────────────────────────────────────────────── */

export default function Home() {
  useGSAPAnimations()

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Amoria&display=swap'); .font-amoria{font-family:'Amoria',serif;}`}</style>
      <PublicNavbar />
      <main className='page-landing'>
        <HeroSection />
        <IntroSection />
        <ConceptSection />
        <MethodeSection />
        <TeamSection />
        <GallerySection />
        <TestimonialsSection />
        <ConsultSection />
      </main>
    </>
  )
}
