import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectSelector } from './project-selector';
import { AppContext } from '@/contexts/AppContext';
import { createMockAppContext, createMockProject } from '@/test/mock-app-context';

describe('ProjectSelector', () => {
  const renderComponent = (contextOverrides = {}) => {
    const mockContext = createMockAppContext(contextOverrides);
    return render(
      <AppContext.Provider value={mockContext}>
        <ProjectSelector />
      </AppContext.Provider>
    );
  };

  it('should render select element', () => {
    renderComponent();
    expect(screen.getByTestId('project-selector')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    renderComponent({ isLoadingProjects: true });
    expect(screen.getByText('Loading projects...')).toBeInTheDocument();
  });

  it('should show no projects message when empty', () => {
    renderComponent({ projects: [] });
    expect(screen.getByText('No projects')).toBeInTheDocument();
  });

  it('should render project options', () => {
    const projects = [
      createMockProject({ name: 'Project 1' }),
      createMockProject({ name: 'Project 2' }),
    ];
    renderComponent({ projects });
    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('Project 2')).toBeInTheDocument();
  });

  it('should call setSelectedProjectId when selection changes', () => {
    const setSelectedProjectId = vi.fn();
    const projects = [createMockProject({ id: 'p_test', name: 'Test Project' })];
    renderComponent({ projects, setSelectedProjectId });
    
    fireEvent.change(screen.getByTestId('project-selector'), { target: { value: 'p_test' } });
    expect(setSelectedProjectId).toHaveBeenCalledWith('p_test');
  });

  it('should be disabled when loading', () => {
    renderComponent({ isLoadingProjects: true });
    expect(screen.getByTestId('project-selector')).toBeDisabled();
  });

  it('should display selected project', () => {
    const project = createMockProject({ id: 'p_selected', name: 'Selected' });
    renderComponent({ projects: [project], selectedProjectId: 'p_selected' });
    expect(screen.getByTestId('project-selector')).toHaveValue('p_selected');
  });
});