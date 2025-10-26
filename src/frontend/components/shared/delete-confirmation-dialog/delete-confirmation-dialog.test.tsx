import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';

describe('DeleteConfirmationDialog', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnConfirm = vi.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    onConfirm: mockOnConfirm,
    title: 'Confirm Deletion',
    description: 'Are you sure you want to delete this item?',
    isDeleting: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render dialog when open', () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);
    
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<DeleteConfirmationDialog {...defaultProps} open={false} />);
    
    expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
  });

  it('should render cancel and delete buttons', () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);
    
    expect(screen.getByTestId('cancel-delete-button')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-delete-button')).toBeInTheDocument();
  });

  it('should call onOpenChange when cancel is clicked', () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('cancel-delete-button'));
    
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('should call onConfirm when delete is clicked', () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);
    
    fireEvent.click(screen.getByTestId('confirm-delete-button'));
    
    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('should show Delete button text when not deleting', () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);
    
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should show Deleting... text when deleting', () => {
    render(<DeleteConfirmationDialog {...defaultProps} isDeleting={true} />);
    
    expect(screen.getByText('Deleting...')).toBeInTheDocument();
  });

  it('should disable buttons when deleting', () => {
    render(<DeleteConfirmationDialog {...defaultProps} isDeleting={true} />);
    
    expect(screen.getByTestId('cancel-delete-button')).toBeDisabled();
    expect(screen.getByTestId('confirm-delete-button')).toBeDisabled();
  });

  it('should enable buttons when not deleting', () => {
    render(<DeleteConfirmationDialog {...defaultProps} isDeleting={false} />);
    
    expect(screen.getByTestId('cancel-delete-button')).not.toBeDisabled();
    expect(screen.getByTestId('confirm-delete-button')).not.toBeDisabled();
  });

  it('should render custom title', () => {
    render(<DeleteConfirmationDialog {...defaultProps} title="Custom Title" />);
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('should render custom description', () => {
    render(<DeleteConfirmationDialog {...defaultProps} description="Custom description text" />);
    
    expect(screen.getByText('Custom description text')).toBeInTheDocument();
  });
});