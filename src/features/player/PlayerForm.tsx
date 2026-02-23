import React, { useState } from 'react';
import { useTranslation } from '../../shared/i18n';
import { PlayerInfo } from '../../shared/types/player';

interface PlayerFormProps {
  onSubmit: (info: PlayerInfo) => void;
}

function PlayerForm({ onSubmit }: PlayerFormProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});
  const { t } = useTranslation();

  const validate = () => {
    const newErrors: { email?: string; phone?: string } = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t.emailError;
    }
    if (!/^\+?[\d\s\-()]{7,15}$/.test(phone)) {
      newErrors.phone = t.phoneError;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ email: email.trim(), phone: phone.trim() });
    }
  };

  return (
    <div className="form-container">
      <h2>{t.welcome}</h2>
      <p className="form-subtitle">{t.formSubtitle}</p>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="email">{t.emailLabel}</label>
          <input
            id="email"
            type="email"
            placeholder={t.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="phone">{t.phoneLabel}</label>
          <input
            id="phone"
            type="tel"
            placeholder={t.phonePlaceholder}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {errors.phone && <span className="form-error">{errors.phone}</span>}
        </div>
        <button type="submit" className="form-submit">
          {t.letsPlay}
        </button>
      </form>
    </div>
  );
}

export default PlayerForm;
