import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { useLowBandwidth } from '../hooks';
import type { UserInfo } from '../types';

interface EligibilityFormProps {
  schemeId: string;
  schemeName: string;
  onSubmit: (userInfo: UserInfo) => void;
  onCancel: () => void;
}

interface FormErrors {
  [key: string]: string;
}

export const EligibilityForm: React.FC<EligibilityFormProps> = ({
  schemeName,
  onSubmit,
  onCancel,
}) => {
  const { isLowBandwidth } = useLowBandwidth();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<Partial<UserInfo>>({
    age: undefined,
    gender: undefined,
    income: undefined,
    state: '',
    category: undefined,
    occupation: '',
    hasDisability: false,
    isBPL: false,
    ownsLand: false,
    landSize: undefined,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Indian states list
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  // Validation rules
  const validateField = (name: string, value: unknown): string => {
    switch (name) {
      case 'age':
        if (typeof value !== 'number' || !value || value < 0) return 'Age is required and must be positive';
        if (value > 120) return 'Please enter a valid age';
        return '';
      case 'gender':
        if (!value) return 'Gender is required';
        return '';
      case 'income':
        if (value === undefined || value === null || value === '') return 'Annual income is required';
        if (typeof value === 'number' && value < 0) return 'Income cannot be negative';
        return '';
      case 'state':
        if (!value || (typeof value === 'string' && value.trim() === '')) return 'State is required';
        return '';
      case 'category':
        if (!value) return 'Category is required';
        return '';
      case 'occupation':
        if (!value || (typeof value === 'string' && value.trim() === '')) return 'Occupation is required';
        return '';
      case 'landSize':
        if (formData.ownsLand && (value === undefined || value === null || value === '')) {
          return 'Land size is required when you own land';
        }
        if (formData.ownsLand && typeof value === 'number' && value < 0) {
          return 'Land size cannot be negative';
        }
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: unknown = value;
    
    if (type === 'number') {
      processedValue = value === '' ? undefined : Number(value);
    } else if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear error when user starts typing
    if (touched.has(name)) {
      const error = validateField(name, processedValue);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setTouched((prev) => new Set(prev).add(name));
    
    const error = validateField(name, type === 'number' ? Number(value) : value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const requiredFields = ['age', 'gender', 'income', 'state', 'category', 'occupation'];
    
    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field as keyof UserInfo]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Validate conditional fields
    if (formData.ownsLand) {
      const landSizeError = validateField('landSize', formData.landSize);
      if (landSizeError) {
        newErrors.landSize = landSizeError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = new Set(['age', 'gender', 'income', 'state', 'category', 'occupation']);
    if (formData.ownsLand) {
      allFields.add('landSize');
    }
    setTouched(allFields);

    if (validateForm()) {
      onSubmit(formData as UserInfo);
    }
  };

  const inputClassName = `
    w-full px-4 py-3 rounded-lg
    bg-white/10 dark:bg-black/20
    border-2 border-white/20 dark:border-white/10
    text-gray-900 dark:text-white
    placeholder-gray-500 dark:placeholder-gray-400
    transition-all duration-300
    focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const labelClassName = 'block text-sm font-medium text-gray-900 dark:text-white mb-2';
  const errorClassName = 'mt-1 text-sm text-red-500 dark:text-red-400';

  const animationProps = isLowBandwidth
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
      };

  return (
    <motion.div {...animationProps}>
      <GlassCard className="p-6 max-w-2xl mx-auto" hover={false}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('schemes.checkEligibility')}
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
          {t('eligibility.form.for')} <span className="font-semibold text-orange-600 dark:text-orange-400">{schemeName}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Age */}
          <div>
            <label htmlFor="age" className={labelClassName}>
              {t('eligibility.form.age')} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age ?? ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClassName}
              placeholder={t('eligibility.form.age')}
              min="0"
              max="120"
              aria-required="true"
              aria-invalid={!!errors.age}
              aria-describedby={errors.age ? 'age-error' : undefined}
            />
            {errors.age && touched.has('age') && (
              <p id="age-error" className={errorClassName} role="alert">
                {errors.age}
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label htmlFor="gender" className={labelClassName}>
              {t('eligibility.form.gender')} <span className="text-red-500">*</span>
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender ?? ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClassName}
              aria-required="true"
              aria-invalid={!!errors.gender}
              aria-describedby={errors.gender ? 'gender-error' : undefined}
            >
              <option value="">{t('eligibility.form.selectGender')}</option>
              <option value="male">{t('eligibility.form.male')}</option>
              <option value="female">{t('eligibility.form.female')}</option>
              <option value="other">{t('eligibility.form.other')}</option>
            </select>
            {errors.gender && touched.has('gender') && (
              <p id="gender-error" className={errorClassName} role="alert">
                {errors.gender}
              </p>
            )}
          </div>

          {/* Annual Income */}
          <div>
            <label htmlFor="income" className={labelClassName}>
              {t('eligibility.form.income')} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="income"
              name="income"
              value={formData.income ?? ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClassName}
              placeholder={t('eligibility.form.income')}
              min="0"
              aria-required="true"
              aria-invalid={!!errors.income}
              aria-describedby={errors.income ? 'income-error' : undefined}
            />
            {errors.income && touched.has('income') && (
              <p id="income-error" className={errorClassName} role="alert">
                {errors.income}
              </p>
            )}
          </div>

          {/* State */}
          <div>
            <label htmlFor="state" className={labelClassName}>
              {t('eligibility.form.state')} <span className="text-red-500">*</span>
            </label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClassName}
              aria-required="true"
              aria-invalid={!!errors.state}
              aria-describedby={errors.state ? 'state-error' : undefined}
            >
              <option value="">{t('eligibility.form.selectState')}</option>
              {indianStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {errors.state && touched.has('state') && (
              <p id="state-error" className={errorClassName} role="alert">
                {errors.state}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className={labelClassName}>
              {t('eligibility.form.category')} <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category ?? ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClassName}
              aria-required="true"
              aria-invalid={!!errors.category}
              aria-describedby={errors.category ? 'category-error' : undefined}
            >
              <option value="">{t('eligibility.form.selectCategory')}</option>
              <option value="general">{t('eligibility.form.general')}</option>
              <option value="obc">{t('eligibility.form.obc')}</option>
              <option value="sc">{t('eligibility.form.sc')}</option>
              <option value="st">{t('eligibility.form.st')}</option>
            </select>
            {errors.category && touched.has('category') && (
              <p id="category-error" className={errorClassName} role="alert">
                {errors.category}
              </p>
            )}
          </div>

          {/* Occupation */}
          <div>
            <label htmlFor="occupation" className={labelClassName}>
              {t('eligibility.form.occupation')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClassName}
              placeholder={t('eligibility.form.occupation')}
              aria-required="true"
              aria-invalid={!!errors.occupation}
              aria-describedby={errors.occupation ? 'occupation-error' : undefined}
            />
            {errors.occupation && touched.has('occupation') && (
              <p id="occupation-error" className={errorClassName} role="alert">
                {errors.occupation}
              </p>
            )}
          </div>

          {/* Conditional Fields */}
          <div className="space-y-4 pt-4 border-t border-white/20 dark:border-white/10">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('eligibility.form.additionalInfo')}
            </h3>

            {/* Land Ownership */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="ownsLand"
                name="ownsLand"
                checked={formData.ownsLand}
                onChange={handleChange}
                className="w-5 h-5 rounded border-2 border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/20 text-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all duration-300"
              />
              <label htmlFor="ownsLand" className="ml-3 text-sm text-gray-900 dark:text-white">
                {t('eligibility.form.ownsLand')}
              </label>
            </div>

            {/* Land Size (conditional) */}
            {formData.ownsLand && (
              <motion.div
                initial={isLowBandwidth ? {} : { opacity: 0, height: 0 }}
                animate={isLowBandwidth ? {} : { opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <label htmlFor="landSize" className={labelClassName}>
                  {t('eligibility.form.landSize')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="landSize"
                  name="landSize"
                  value={formData.landSize ?? ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClassName}
                  placeholder={t('eligibility.form.landSize')}
                  min="0"
                  step="0.01"
                  aria-required="true"
                  aria-invalid={!!errors.landSize}
                  aria-describedby={errors.landSize ? 'landSize-error' : undefined}
                />
                {errors.landSize && touched.has('landSize') && (
                  <p id="landSize-error" className={errorClassName} role="alert">
                    {errors.landSize}
                  </p>
                )}
              </motion.div>
            )}

            {/* Disability Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasDisability"
                name="hasDisability"
                checked={formData.hasDisability}
                onChange={handleChange}
                className="w-5 h-5 rounded border-2 border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/20 text-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all duration-300"
              />
              <label htmlFor="hasDisability" className="ml-3 text-sm text-gray-900 dark:text-white">
                {t('eligibility.form.hasDisability')}
              </label>
            </div>

            {/* BPL Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isBPL"
                name="isBPL"
                checked={formData.isBPL}
                onChange={handleChange}
                className="w-5 h-5 rounded border-2 border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/20 text-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all duration-300"
              />
              <label htmlFor="isBPL" className="ml-3 text-sm text-gray-900 dark:text-white">
                {t('eligibility.form.isBPL')}
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <GlassButton
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-green-500 text-white font-semibold"
            >
              {t('schemes.checkEligibility')}
            </GlassButton>
            <GlassButton
              type="button"
              onClick={onCancel}
              className="px-8"
            >
              {t('common.cancel')}
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </motion.div>
  );
};
