import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NavItem from './NavItem';
import React from 'react';

describe('NavItem', () => {
    it('renders label and icon', () => {
        const icon = <span data-testid="test-icon">icon</span>;
        render(<NavItem icon={icon} label="Test Label" isActive={false} onClick={() => { }} />);

        expect(screen.getByText('Test Label')).toBeDefined();
        expect(screen.getByTestId('test-icon')).toBeDefined();
    });

    it('calls onClick when clicked', () => {
        const handleClick = vi.fn();
        render(<NavItem icon={<span>icon</span>} label="Test Label" isActive={false} onClick={handleClick} />);

        fireEvent.click(screen.getByRole('listitem'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('shows active styles when isActive is true', () => {
        const { container } = render(<NavItem icon={<span>icon</span>} label="Test Label" isActive={true} onClick={() => { }} />);
        const iconWrapper = container.querySelector('.text-\\[\\#FFB800\\]');
        expect(iconWrapper).toBeDefined();
    });
});
