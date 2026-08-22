

import {
  Search,
  Eye,
  Heart,
  Phone,
  PlusCircle,
  Send,
  ClipboardList,
  BadgeCheck,
  ArrowRight
} from 'lucide-react';

import { useLanguage } from '../contexts/LanguageContext';

const BUYER_STEPS = [
  { icon: Search, titleKey: 'aboutStepSearch', descKey: 'aboutStepSearchDesc' },
  { icon: Eye, titleKey: 'aboutStepDetails', descKey: 'aboutStepDetailsDesc' },
  { icon: Heart, titleKey: 'aboutStepFavorites', descKey: 'aboutStepFavoritesDesc' },
  { icon: Phone, titleKey: 'aboutStepContact', descKey: 'aboutStepContactDesc' },
];

const SELLER_STEPS = [
  { icon: PlusCircle, titleKey: 'aboutStepCreate', descKey: 'aboutStepCreateDesc' },
  { icon: Send, titleKey: 'aboutStepSubmit', descKey: 'aboutStepSubmitDesc' },
  { icon: ClipboardList, titleKey: 'aboutStepApproval', descKey: 'aboutStepApprovalDesc' },
  { icon: BadgeCheck, titleKey: 'aboutStepLive', descKey: 'aboutStepLiveDesc' },
];

export function HowItWorks() {
  const { t } = useLanguage();

  return (
    <div className="about-page">
      <div className="how-container">

        <section className="how-top-intro how-top-section">
  <div className="how-top-label">
    <span className="how-top-line"></span>

    <span className="how-hero-new-kicker">
      {t('howKicker')}
    </span>

    <span className="how-top-line"></span>
  </div>

  <h1 className="how-hero-new-title">
    {t('howTitle')}
  </h1>

  <p className="how-hero-new-sub">
    {t('howSub')}
  </p>

  <div className="how-top-dots">
    <span></span>
    <span></span>
    <span></span>
  </div>
</section>

        <section className="about-section">

          <div className="how-journey how-buyer-journey">
            <div className="how-journey-head">
              <div className="how-journey-badge blue">
                <Search />
              </div>

              <h3 className="how-journey-title">
                {t('aboutBuyerJourney')}
              </h3>
            </div>

            <div className="how-stepper">
              {BUYER_STEPS.map((step, index) => (
                <div className="how-step" key={step.titleKey}>

                  <div className="how-step-inner">
                    <div className="how-step-num">
                      {index + 1}
                    </div>

                    <div className="how-step-icon">
                      <step.icon />
                    </div>

                    <div className="how-step-title">
                      {t(step.titleKey)}
                    </div>

                    <div className="how-step-desc">
                      {t(step.descKey)}
                    </div>
                  </div>

                  {index < BUYER_STEPS.length - 1 && (
                    <div className="how-step-arrow">
                      <ArrowRight />
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>

          <div className="how-journey how-seller-journey">
            <div className="how-journey-head">
              <div className="how-journey-badge violet">
                <PlusCircle />
              </div>

              <h3 className="how-journey-title">
                {t('aboutSellerJourney')}
              </h3>
            </div>

            <div className="how-stepper">
              {SELLER_STEPS.map((step, index) => (
                <div className="how-step" key={step.titleKey}>

                  <div className="how-step-inner">
                    <div className="how-step-num violet">
                      {index + 1}</div>

                    <div className="how-step-icon">
                      <step.icon />
                    </div>

                    <div className="how-step-title">
                      {t(step.titleKey)}
                    </div>

                    <div className="how-step-desc">
                      {t(step.descKey)}
                    </div>
                  </div>

                  {index < SELLER_STEPS.length - 1 && (
                    <div className="how-step-arrow">
                      <ArrowRight />
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}