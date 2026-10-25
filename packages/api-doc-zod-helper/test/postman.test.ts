import { PostmanZodHelper } from '../src';
import { expect } from 'chai';
import { describe, it } from 'node:test';
import { z } from 'zod/v4';

describe('PostmanZodHelper', () => {
  describe('getFirstItem', () => {
    it('returns a helper for the element of an array', () => {
      const h = new PostmanZodHelper({ value: z.array(z.string()) });

      const item = h.getFirstItem();

      expect(item).to.be.instanceOf(PostmanZodHelper);
      expect(item?.isValid()).to.equal(true);
      expect(item?.getType()).to.equal('string');
    });

    it('sees through optional, default and preprocess wrappers', () => {
      const wrapped = z.preprocess((x) => (Array.isArray(x) ? x : [x]), z.array(z.int()).default([1]).optional());

      const item = new PostmanZodHelper({ value: wrapped }).getFirstItem();

      expect(item?.getType()).to.equal('integer');
    });

    it('lets you walk into an array of objects', () => {
      const h = new PostmanZodHelper({
        value: z.array(z.object({ id: z.uuid(), label: z.string().optional() })).optional(),
      });

      const children = h.getFirstItem()?.getChildren() ?? {};

      expect(Object.keys(children)).to.have.members(['id', 'label']);
      expect(children.id.getType()).to.equal('uuid');
      expect(children.id.isRequired()).to.equal(true);
      expect(children.label.isRequired()).to.equal(false);
    });

    it('returns undefined when the schema is not an array', () => {
      expect(new PostmanZodHelper({ value: z.string() }).getFirstItem()).to.equal(undefined);
      expect(new PostmanZodHelper({ value: z.object({}) }).getFirstItem()).to.equal(undefined);
    });

    it('returns undefined for an invalid schema', () => {
      expect(new PostmanZodHelper({ value: { not: 'a schema' } }).getFirstItem()).to.equal(undefined);
      expect(new PostmanZodHelper({}).getFirstItem()).to.equal(undefined);
    });
  });

  describe('getChildren', () => {
    it('returns one helper per object property', () => {
      const h = new PostmanZodHelper({
        value: z.object({
          name: z.string().min(1),
          age: z.number().optional(),
          tags: z.array(z.string()),
        }),
      });

      const children = h.getChildren();

      expect(Object.keys(children)).to.have.members(['name', 'age', 'tags']);
      expect(children.name).to.be.instanceOf(PostmanZodHelper);
      expect(children.name.getType()).to.equal('string');
      expect(children.name.isRequired()).to.equal(true);
      expect(children.age.getType()).to.equal('number');
      expect(children.age.isRequired()).to.equal(false);
      expect(children.tags.getType()).to.equal('array');
      expect(children.tags.getFirstItem()?.getType()).to.equal('string');
    });

    it('works through optional wrappers and loose objects', () => {
      const h = new PostmanZodHelper({ value: z.looseObject({ picture: z.url() }).optional() });

      expect(Object.keys(h.getChildren())).to.deep.equal(['picture']);
    });

    it('supports nested objects', () => {
      const h = new PostmanZodHelper({
        value: z.object({ address: z.object({ city: z.string() }) }),
      });

      const city = h.getChildren().address.getChildren().city;

      expect(city.getType()).to.equal('string');
    });

    it('returns an empty record for non-object or invalid schemas', () => {
      expect(new PostmanZodHelper({ value: z.string() }).getChildren()).to.deep.equal({});
      expect(new PostmanZodHelper({ value: z.array(z.string()) }).getChildren()).to.deep.equal({});
      expect(new PostmanZodHelper({ value: 'nope' }).getChildren()).to.deep.equal({});
    });
  });

  describe('getAlternatives', () => {
    it('returns a helper per union option', () => {
      const h = new PostmanZodHelper({ value: z.union([z.string(), z.number(), z.array(z.boolean())]) });

      const alternatives = h.getAlternatives();

      expect(alternatives.map((a) => a.getType())).to.deep.equal(['string', 'number', 'array']);
      alternatives.forEach((a) => expect(a).to.be.instanceOf(PostmanZodHelper));
    });

    it('skips literal options', () => {
      const h = new PostmanZodHelper({ value: z.union([z.literal('auto'), z.literal(0), z.string(), z.number()]) });

      expect(h.getAlternatives().map((a) => a.getType())).to.deep.equal(['string', 'number']);
    });

    it('finds the union behind optional and default wrappers', () => {
      const h = new PostmanZodHelper({ value: z.union([z.string(), z.int()]).default(1).optional() });

      expect(h.getAlternatives().map((a) => a.getType())).to.deep.equal(['string', 'integer']);
    });

    it('returns an empty array when there is no union', () => {
      expect(new PostmanZodHelper({ value: z.string() }).getAlternatives()).to.deep.equal([]);
      expect(new PostmanZodHelper({ value: z.string().optional() }).getAlternatives()).to.deep.equal([]);
      expect(new PostmanZodHelper({ value: undefined }).getAlternatives()).to.deep.equal([]);
    });
  });

  describe('contentType', () => {
    it('reads contentType from the schema meta', () => {
      const h = new PostmanZodHelper({ value: z.string().meta({ contentType: 'application/json' }) });

      expect(h.hasContentType()).to.equal(true);
      expect(h.getContentType()).to.equal('application/json');
    });

    it('reads meta set on an outer wrapper', () => {
      const h = new PostmanZodHelper({ value: z.string().optional().meta({ contentType: 'text/plain' }) });

      expect(h.hasContentType()).to.equal(true);
      expect(h.getContentType()).to.equal('text/plain');
    });

    it('is absent without meta', () => {
      const h = new PostmanZodHelper({ value: z.string() });

      expect(h.hasContentType()).to.equal(false);
      expect(h.getContentType()).to.equal(undefined);
    });

    it('ignores a non-string contentType', () => {
      const h = new PostmanZodHelper({ value: z.string().meta({ contentType: 42 }) });

      expect(h.hasContentType()).to.equal(false);
      expect(h.getContentType()).to.equal(undefined);
    });
  });

  describe('descriptionType', () => {
    it('reads descriptionType from the schema meta', () => {
      const h = new PostmanZodHelper({ value: z.string().meta({ descriptionType: 'text/markdown' }) });

      expect(h.hasDescriptionType()).to.equal(true);
      expect(h.getDescriptionType()).to.equal('text/markdown');
    });

    it('is absent without meta or with a non-string value', () => {
      const none = new PostmanZodHelper({ value: z.string() });
      const bad = new PostmanZodHelper({ value: z.string().meta({ descriptionType: true }) });

      expect(none.hasDescriptionType()).to.equal(false);
      expect(none.getDescriptionType()).to.equal(undefined);
      expect(bad.hasDescriptionType()).to.equal(false);
      expect(bad.getDescriptionType()).to.equal(undefined);
    });

    it('does not mix up with contentType', () => {
      const h = new PostmanZodHelper({
        value: z.string().meta({ contentType: 'application/xml', descriptionType: 'text/html' }),
      });

      expect(h.getContentType()).to.equal('application/xml');
      expect(h.getDescriptionType()).to.equal('text/html');
    });
  });

  describe('xml', () => {
    it('reads the xml meta object', () => {
      const xml = { name: 'item', wrapped: true };
      const h = new PostmanZodHelper({ value: z.array(z.string()).meta({ xml }) });

      expect(h.hasXml()).to.equal(true);
      expect(h.getXml()).to.deep.equal(xml);
    });

    it('is absent without meta or when xml is not an object', () => {
      const none = new PostmanZodHelper({ value: z.array(z.string()) });
      const bad = new PostmanZodHelper({ value: z.string().meta({ xml: 'nope' }) });

      expect(none.hasXml()).to.equal(false);
      expect(none.getXml()).to.equal(undefined);
      expect(bad.hasXml()).to.equal(false);
    });
  });

  describe('invalid schema', () => {
    it('reports no meta at all', () => {
      const h = new PostmanZodHelper({ value: { meta: () => ({ contentType: 'x', xml: {} }) } });

      expect(h.isValid()).to.equal(false);
      expect(h.hasContentType()).to.equal(false);
      expect(h.hasDescriptionType()).to.equal(false);
      expect(h.hasXml()).to.equal(false);
    });
  });

  describe('inherited behavior', () => {
    it('shares min/max detection with the base helper', () => {
      const h = new PostmanZodHelper({ value: z.array(z.string()).min(1).max(4).optional() });

      expect(h.getType()).to.equal('array');
      expect(h.hasMin()).to.equal(true);
      expect(h.hasMax()).to.equal(true);
      expect(h.getMin()).to.equal(1);
      expect(h.getMax()).to.equal(4);
    });
  });
});
