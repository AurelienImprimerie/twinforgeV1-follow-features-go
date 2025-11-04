import React from 'react';
import { Loader2, Save } from 'lucide-react';
import MenstrualCycleSection from './components/menstrual/MenstrualCycleSection';
import CycleRegularitySection from './components/menstrual/CycleRegularitySection';
import CurrentCycleInfoCard from './components/menstrual/CurrentCycleInfoCard';
import { useProfileMenstrualForm } from './hooks/useProfileMenstrualForm';
import GlassCard from '../../../ui/cards/GlassCard';

const ProfileMenstrualTab: React.FC = () => {
  const {
    formData,
    updateFormData,
    errors,
    isLoading,
    isSaving,
    handleSave,
  } = useProfileMenstrualForm();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--circuit-health)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GlassCard
        title="À propos du suivi menstruel"
        variant="frosted"
        className="p-6"
      >
        <div className="space-y-3 text-white/80">
          <p>
            Le suivi de votre cycle menstruel permet à TwinForge de personnaliser vos recommandations
            en fonction de votre phase cyclique actuelle.
          </p>
          <ul className="space-y-2 ml-4 text-sm text-white/60">
            <li>• Recommandations d'entraînement adaptées à votre énergie</li>
            <li>• Conseils nutritionnels selon vos besoins hormonaux</li>
            <li>• Explication des variations de poids et d'énergie</li>
            <li>• Alertes proactives pour optimiser votre bien-être</li>
          </ul>
        </div>
      </GlassCard>

      {formData.lastPeriodDate && (
        <CurrentCycleInfoCard
          lastPeriodDate={formData.lastPeriodDate}
          averageCycleLength={formData.averageCycleLength}
        />
      )}

      <MenstrualCycleSection
        value={{
          lastPeriodDate: formData.lastPeriodDate,
          averageCycleLength: formData.averageCycleLength,
          averagePeriodDuration: formData.averagePeriodDuration,
        }}
        onChange={(value) => updateFormData(value)}
        errors={errors}
      />

      <CycleRegularitySection
        value={{
          cycleRegularity: formData.cycleRegularity,
          trackingSymptoms: formData.trackingSymptoms,
        }}
        onChange={(value) => updateFormData(value)}
      />

      <div className="flex justify-end gap-4 pt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-[var(--circuit-health)] hover:bg-[var(--circuit-health)]/80 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Enregistrer
            </>
          )}
        </button>
      </div>

      <GlassCard variant="frosted" className="p-6">
        <div className="space-y-2">
          <h3 className="text-white font-medium flex items-center gap-2">
            🔒 Confidentialité et sécurité
          </h3>
          <p className="text-sm text-white/60">
            Vos données menstruelles sont strictement confidentielles et protégées par chiffrement.
            Elles ne sont utilisées que pour personnaliser vos recommandations et ne sont jamais partagées.
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default ProfileMenstrualTab;
