import { useState, useEffect } from 'react';
import { useUserStore } from '../../../../system/store/userStore';
import { supabase } from '../../../../system/supabase/client';
import logger from '../../../../lib/utils/logger';
import { useToast } from '../../../../ui/components/ToastProvider';
import type { ReproductiveStatus, PerimenopauseStage, MenopauseFormData } from '../../../../domain/menopause';

export function useMenopauseForm() {
  const profile = useUserStore((state) => state.profile);
  const { showToast } = useToast();

  const [formData, setFormData] = useState<MenopauseFormData>({
    reproductive_status: 'menstruating',
    perimenopause_stage: null,
    last_period_date: '',
    menopause_confirmation_date: '',
    fsh_level: '',
    estrogen_level: '',
    last_hormone_test_date: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.user_id) {
      loadMenopauseData();
    }
  }, [profile?.user_id]);

  const loadMenopauseData = async () => {
    if (!profile?.user_id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('menopause_tracking')
        .select('*')
        .eq('user_id', profile.user_id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFormData({
          reproductive_status: data.reproductive_status as ReproductiveStatus,
          perimenopause_stage: data.perimenopause_stage as PerimenopauseStage | null,
          last_period_date: data.last_period_date || '',
          menopause_confirmation_date: data.menopause_confirmation_date || '',
          fsh_level: data.fsh_level?.toString() || '',
          estrogen_level: data.estrogen_level?.toString() || '',
          last_hormone_test_date: data.last_hormone_test_date || '',
          notes: data.notes || '',
        });
      }
    } catch (error) {
      logger.error('MENOPAUSE_FORM', 'Failed to load menopause data', { error });
      showToast('Erreur lors du chargement des données', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.reproductive_status !== 'menstruating' && !formData.last_period_date) {
      newErrors.last_period_date = 'Date requise pour périménopause/ménopause';
    }

    if (formData.fsh_level && parseFloat(formData.fsh_level) < 0) {
      newErrors.fsh_level = 'Valeur invalide';
    }

    if (formData.estrogen_level && parseFloat(formData.estrogen_level) < 0) {
      newErrors.estrogen_level = 'Valeur invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!profile?.user_id) {
      showToast('Profil non chargé', 'error');
      return;
    }

    if (!validate()) {
      showToast('Veuillez corriger les erreurs', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('menopause_tracking').upsert(
        {
          user_id: profile.user_id,
          reproductive_status: formData.reproductive_status,
          perimenopause_stage: formData.perimenopause_stage,
          last_period_date: formData.last_period_date || null,
          menopause_confirmation_date: formData.menopause_confirmation_date || null,
          fsh_level: formData.fsh_level ? parseFloat(formData.fsh_level) : null,
          estrogen_level: formData.estrogen_level ? parseFloat(formData.estrogen_level) : null,
          last_hormone_test_date: formData.last_hormone_test_date || null,
          notes: formData.notes || null,
        },
        {
          onConflict: 'user_id',
        }
      );

      if (error) throw error;

      showToast('Données sauvegardées avec succès', 'success');
      logger.info('MENOPAUSE_FORM', 'Menopause data saved successfully');
    } catch (error) {
      logger.error('MENOPAUSE_FORM', 'Failed to save menopause data', { error });
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormData = (updates: Partial<MenopauseFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setErrors({});
  };

  return {
    formData,
    updateFormData,
    errors,
    isLoading,
    isSaving,
    handleSave,
  };
}
