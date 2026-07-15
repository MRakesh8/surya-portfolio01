import { create } from 'zustand';
import { supabase } from '../supabaseClient';

const usePortfolioStore = create((set) => ({
  sections: {},
  loading: true,

  fetchContent: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('is_visible', true); // Only fetch visible sections for public site

      if (error) throw error;

      // Transform array of sections into a key-value map for easy access in components
      const sectionsMap = {};
      data.forEach(section => {
        sectionsMap[section.section_key] = section.content_published;
      });

      set({ sections: sectionsMap, loading: false });
    } catch (err) {
      console.error('Error fetching public content:', err);
      set({ loading: false });
    }
  }
}));

export default usePortfolioStore;
