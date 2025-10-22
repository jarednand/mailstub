import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectActionsMenu } from './project-actions-menu';

describe('ProjectActionsMenu', () => {
  const mockOnCreateProject = vi.fn();
  const mockOnEditProject = vi.fn();
  const mockOnDeleteProject = vi.fn();

  const defaultProps = {
    onCreateProject: mockOnCreateProject,
    onEditProject: mockOnEditProject,
    onDeleteProject: mockOnDeleteProject,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the dropdown trigger button', () => {
      render(<ProjectActionsMenu {...defaultProps} />);

      const triggerButton = screen.getByTestId('project-actions-menu-trigger');
      expect(triggerButton).toBeInTheDocument();
      expect(triggerButton).toHaveClass('h-7', 'w-7');
    });

    it('does not show menu items initially', () => {
      render(<ProjectActionsMenu {...defaultProps} />);

      expect(screen.queryByText('New Project')).not.toBeInTheDocument();
      expect(screen.queryByText('Edit Project')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete Project')).not.toBeInTheDocument();
    });

    it('shows menu items when trigger is clicked', async () => {
      const user = userEvent.setup();
      render(<ProjectActionsMenu {...defaultProps} />);

      const triggerButton = screen.getByTestId('project-actions-menu-trigger');
      await user.click(triggerButton);

      expect(screen.getByText('New Project')).toBeInTheDocument();
      expect(screen.getByText('Edit Project')).toBeInTheDocument();
      expect(screen.getByText('Delete Project')).toBeInTheDocument();
    });
  });

  describe('Menu interactions', () => {
    it('calls onCreateProject when New Project is clicked', async () => {
      const user = userEvent.setup();
      render(<ProjectActionsMenu {...defaultProps} />);

      const triggerButton = screen.getByTestId('project-actions-menu-trigger');
      await user.click(triggerButton);

      const newProjectItem = screen.getByTestId('create-project-menu-item');
      await user.click(newProjectItem);

      expect(mockOnCreateProject).toHaveBeenCalledTimes(1);
      expect(mockOnEditProject).not.toHaveBeenCalled();
      expect(mockOnDeleteProject).not.toHaveBeenCalled();
    });

    it('calls onEditProject when Edit Project is clicked', async () => {
      const user = userEvent.setup();
      render(<ProjectActionsMenu {...defaultProps} />);

      const triggerButton = screen.getByTestId('project-actions-menu-trigger');
      await user.click(triggerButton);

      const editProjectItem = screen.getByTestId('edit-project-menu-item');
      await user.click(editProjectItem);

      expect(mockOnEditProject).toHaveBeenCalledTimes(1);
      expect(mockOnCreateProject).not.toHaveBeenCalled();
      expect(mockOnDeleteProject).not.toHaveBeenCalled();
    });

    it('calls onDeleteProject when Delete Project is clicked', async () => {
      const user = userEvent.setup();
      render(<ProjectActionsMenu {...defaultProps} />);

      const triggerButton = screen.getByTestId('project-actions-menu-trigger');
      await user.click(triggerButton);

      const deleteProjectItem = screen.getByTestId('delete-project-menu-item');
      await user.click(deleteProjectItem);

      expect(mockOnDeleteProject).toHaveBeenCalledTimes(1);
      expect(mockOnCreateProject).not.toHaveBeenCalled();
      expect(mockOnEditProject).not.toHaveBeenCalled();
    });
  });

  describe('Menu structure', () => {
    it('renders menu items in correct order', async () => {
      const user = userEvent.setup();
      render(<ProjectActionsMenu {...defaultProps} />);

      const triggerButton = screen.getByTestId('project-actions-menu-trigger');
      await user.click(triggerButton);

      const menuItems = screen.getAllByRole('menuitem');
      
      expect(menuItems).toHaveLength(3);
      expect(menuItems[0]).toHaveTextContent('New Project');
      expect(menuItems[1]).toHaveTextContent('Edit Project');
      expect(menuItems[2]).toHaveTextContent('Delete Project');
    });

    it('applies correct styling to delete menu item', async () => {
      const user = userEvent.setup();
      render(<ProjectActionsMenu {...defaultProps} />);

      const triggerButton = screen.getByTestId('project-actions-menu-trigger');
      await user.click(triggerButton);

      const deleteItem = screen.getByTestId('delete-project-menu-item');
      
      expect(deleteItem).toHaveClass('text-red-600', 'dark:text-red-400');
    });
  });

  describe('Keyboard navigation', () => {
    it('opens menu with Enter key', async () => {
      const user = userEvent.setup();
      render(<ProjectActionsMenu {...defaultProps} />);

      const triggerButton = screen.getByTestId('project-actions-menu-trigger');
      triggerButton.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByText('New Project')).toBeInTheDocument();
    });

    it('opens menu with Space key', async () => {
      const user = userEvent.setup();
      render(<ProjectActionsMenu {...defaultProps} />);

      const triggerButton = screen.getByTestId('project-actions-menu-trigger');
      triggerButton.focus();
      await user.keyboard(' ');

      expect(screen.getByText('New Project')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA roles', async () => {
      const user = userEvent.setup();
      render(<ProjectActionsMenu {...defaultProps} />);

      const triggerButton = screen.getByTestId('project-actions-menu-trigger');
      await user.click(triggerButton);

      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getAllByRole('menuitem')).toHaveLength(3);
    });

    it('trigger button is keyboard accessible', () => {
      render(<ProjectActionsMenu {...defaultProps} />);

      const triggerButton = screen.getByTestId('project-actions-menu-trigger');
      triggerButton.focus();
      
      expect(triggerButton).toHaveFocus();
    });
  });
});