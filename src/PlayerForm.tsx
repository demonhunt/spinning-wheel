import React, { useState } from 'react';

interface PlayerFormProps {
  onSubmit: (info: { email: string; phone: string }) => void;
}

function PlayerForm({ onSubmit }: PlayerFormProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; phone?: string } = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!/^\+?[\d\s\-()]{7,15}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number.';
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
      <h2>Welcome! 🎉</h2>
      <p className="form-subtitle">Enter your info to spin the wheel</p>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            type="tel"
            placeholder="+1 234 567 8900"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {errors.phone && <span className="form-error">{errors.phone}</span>}
        </div>
        <button type="submit" className="form-submit">
          Let's Play!
        </button>
      </form>
    </div>
  );
}

export default PlayerForm;
